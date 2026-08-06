import { NextResponse } from 'next/server';

const API_URL = 'https://api.gutstore.my.id/v1/chat/completions';
const API_KEY = process.env.CHAT_API_KEY || '';
const MODEL = 'ling-3.0-flash';

export async function POST(req) {
  try {
    const { messages, products } = await req.json();

    const productList = (products || [])
      .map(p => `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')} (${p.category})`)
      .join('\n');

    const systemPrompt = `Kamu adalah asisten belanja PresUMart, marketplace khusus mahasiswa President University. Bantu user menemukan produk yang mereka cari.

Produk yang tersedia saat ini:
${productList || 'Belum ada produk.'}

Tugasmu:
- Rekomendasikan produk berdasarkan apa yang user cari
- Jawab dalam Bahasa Indonesia yang santai, sopan, dan friendly
- Jika produk tidak tersedia, sarankan user untuk cek lagi nanti
- Jangan rekomendasikan produk di luar daftar yang tersedia
- DILARANG menggunakan tanda bintang ganda atau tunggal (seperti ** atau *) pada teks balasan. Tulis nama produk dan harga dengan teks biasa tanpa format markdown bintang.`;

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
      const errorText = await res.text().catch(() => '');
      console.error('External Chat API error:', res.status, errorText);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content || 'Maaf, AI tidak memberikan tanggapan.';
    
    // Hapus semua tanda bintang (asterisk) dari balasan
    reply = reply.replace(/\*/g, '');

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Next.js API Chat Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
