import { NextResponse } from 'next/server';

const API_URL = 'https://api.gutstore.my.id/v1/chat/completions';
const API_KEY = process.env.CHAT_API_KEY || '';
const MODEL = 'gemini-3.5-flash';

const DEFAULT_FRIENDLY_REPLY = 'Waduh, barang atau produk yang kamu cari belum tersedia saat ini di PresUMart 😅. Kamu bisa cek lagi nanti atau jadi yang pertama menjual barang ini di menu Jual Barang!';

function generateSmartFallbackReply(userQuery: string, products: any[]) {
  const queryLower = (userQuery || '').toLowerCase();
  const stopWords = ['saya', 'mau', 'beli', 'cari', 'ada', 'kah', 'apa', 'di', 'dan', 'yang', 'ini', 'itu', 'tolong'];

  const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 3 && !stopWords.includes(w));

  const matches = (products || []).filter(p => {
    const nameLower = (p.name || '').toLowerCase();
    const catLower = (p.category || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();

    if (queryLower.length >= 3 && (nameLower.includes(queryLower) || queryLower.includes(nameLower))) return true;

    if (queryWords.length > 0) {
      const pText = `${nameLower} ${catLower} ${descLower}`;
      const hitCount = queryWords.filter(qw => pText.includes(qw)).length;
      return hitCount >= 1;
    }
    return false;
  });

  if (matches.length > 0) {
    const listStr = matches.map(m => `- ${m.name} (Rp${Number(m.price).toLocaleString('id-ID')})`).join('\n');
    return `Tentu, ada nih! Produk yang kamu cari tersedia di PresUMart:\n${listStr}\n\nKamu bisa langsung cek detail kartu produk dan masukkan ke keranjang di bawah ya!`;
  }

  return DEFAULT_FRIENDLY_REPLY;
}

export async function POST(req: Request) {
  let userQuery = '';
  let productListArr: any[] = [];
  try {
    const { messages, products } = await req.json();
    productListArr = products || [];

    const lastUserMsg = (messages || []).slice().reverse().find((m: any) => m.role === 'user');
    userQuery = lastUserMsg ? lastUserMsg.content : '';

    const productList = productListArr
      .map((p: any) => `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')} (${p.category})`)
      .join('\n');

    const systemPrompt = `Kamu adalah Asisten AI PresUMart, marketplace khusus mahasiswa President University Jababeka.

Daftar produk yang sedang dijual mahasiswa saat ini:
${productList || 'Belum ada produk.'}

Aturan Jawabanmu:
1. Jika produk yang dicari user ADA di daftar di atas, rekomendasikan nama produk dan harganya dengan ramah.
2. Jika produk yang dicari user BELUM ADA di daftar di atas, JANGAN PERNAH menjawab "Maaf AI tidak memberikan tanggapan" atau kalimat kaku! Jawablah dengan hangat dan sopan: "Waduh, produk yang kamu cari belum ada yang menjual saat ini di PresUMart 😅. Kamu bisa berkala cek lagi nanti, atau kamu bisa pasang iklan jual barang ini di menu Jual Barang!"
3. Gunakan Bahasa Indonesia yang ramah, sopan, dan membantu layaknya sesama mahasiswa President University.
4. DILARANG menggunakan tanda bintang ganda atau tunggal (seperti ** atau *). Tulis teks biasa tanpa format bintang markdown.`;

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
      ],
      max_tokens: 500,
      temperature: 0.7,
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('External Chat API error status:', res.status);
      const fallbackReply = generateSmartFallbackReply(userQuery, productListArr);
      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply || reply.includes('tidak memberikan tanggapan') || reply.includes('Waduh, produk yang kamu cari belum ada')) {
      reply = generateSmartFallbackReply(userQuery, productListArr);
    }

    // Hapus semua tanda bintang (asterisk) dari balasan
    reply = reply.replace(/\*/g, '');

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Next.js API Chat Route Error:', error);
    const fallbackReply = generateSmartFallbackReply(userQuery, productListArr);
    return NextResponse.json({ reply: fallbackReply });
  }
}
