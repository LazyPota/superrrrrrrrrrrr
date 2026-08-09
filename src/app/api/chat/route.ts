import { NextResponse } from 'next/server';

const API_URL = 'https://api.gutstore.my.id/v1/chat/completions';
const API_KEY = process.env.CHAT_API_KEY || '';
const MODEL = 'nemotron-3-ultra';

const DEFAULT_FRIENDLY_REPLY = 'Waduh, produk yang kamu cari belum ada yang menjual saat ini di PresUMart 😅. Kamu bisa berkala cek lagi nanti, atau kamu bisa pasang iklan jual barang ini di menu Jual Barang!';

function generateSmartFallbackReply(userQuery: string, products: any[]) {
  const queryLower = (userQuery || '').toLowerCase();
  const stopWords = ['saya', 'mau', 'beli', 'cari', 'ada', 'kah', 'apa', 'di', 'dan', 'yang', 'ini', 'itu', 'tolong', 'rekomendasi', 'saran', 'dong', 'ya', 'kak', 'min'];

  const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 3 && !stopWords.includes(w));

  // Intent & category mappings
  const intentMap: Record<string, string[]> = {
    food: ['makan', 'lapar', 'jajan', 'haus', 'minum', 'kuliner', 'snack', 'mie', 'ayam'],
    gaming: ['akun', 'game', 'gaming', 'mlbb', 'mobile legends', 'valorant', 'genshin', 'pubg', 'steam', 'rank', 'skin', 'diamond', 'char', 'joki'],
    study: ['buku', 'kuliah', 'belajar', 'kalkulus', 'calculus', 'tulis', 'pen', 'stewart'],
    electronics: ['laptop', 'kalkulator', 'komputer', 'casio', 'elektronik', 'hp', 'gadget', 'koding', 'tugas'],
    apparel: ['jaket', 'hoodie', 'baju', 'pakaian', 'kaos', 'celana', 'fashion'],
    sports: ['sepatu', 'futsal', 'olahraga', 'nike', 'bola'],
    dorm: ['kost', 'kasur', 'asrama', 'kamar', 'furniture', 'lipat'],
    services: ['jasa', 'desain', 'logo', 'banner', 'poster', 'edit'],
  };

  let matchedCategory = '';
  for (const [catKey, keywords] of Object.entries(intentMap)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      matchedCategory = catKey;
      break;
    }
  }

  let matches = (products || []).filter(p => {
    const nameLower = (p.name || '').toLowerCase();
    const catLower = (p.category || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const fullText = `${nameLower} ${catLower} ${descLower}`;

    // Direct match
    if (queryLower.length >= 3 && (nameLower.includes(queryLower) || queryLower.includes(nameLower))) return true;

    // Word match
    if (queryWords.length > 0) {
      const hitCount = queryWords.filter(qw => fullText.includes(qw)).length;
      if (hitCount >= 1) return true;
    }

    // Category intent match
    if (matchedCategory === 'food' && catLower.includes('makanan')) return true;
    if (matchedCategory === 'study' && (catLower.includes('buku') || nameLower.includes('buku') || nameLower.includes('kalkulus'))) return true;
    if (matchedCategory === 'electronics' && (catLower.includes('elektronik') || nameLower.includes('laptop') || nameLower.includes('kalkulator'))) return true;
    if (matchedCategory === 'apparel' && (catLower.includes('pakaian') || nameLower.includes('hoodie') || nameLower.includes('jaket'))) return true;
    if (matchedCategory === 'sports' && (catLower.includes('olahraga') || nameLower.includes('sepatu') || nameLower.includes('futsal'))) return true;
    if (matchedCategory === 'dorm' && (catLower.includes('kost') || nameLower.includes('kasur'))) return true;
    if (matchedCategory === 'services' && (catLower.includes('jasa') || nameLower.includes('desain'))) return true;

    return false;
  });

  // Filter budget / nego if requested
  if (queryLower.includes('nego') || queryLower.includes('tawar')) {
    const negoOnly = matches.filter(m => m.allowNego !== false);
    if (negoOnly.length > 0) matches = negoOnly;
  }

  if (queryLower.includes('murah') || queryLower.includes('hemat')) {
    matches.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (matches.length > 0) {
    const listStr = matches.map(m => `- ${m.name}: Rp${Number(m.price).toLocaleString('id-ID')} (${m.category}${m.allowNego !== false ? ' • Bisa Nego' : ' • Harga Pas'})`).join('\n');
    return `Tentu, ada nih! Ini rekomendasi produk PresUMart yang cocok buat kamu:\n\n${listStr}\n\nKamu bisa klik kartu produk di bawah untuk lihat detail, ajukan nego, atau langsung tambah ke keranjang ya!`;
  }

  // FAQ / Features Fallback
  if (queryLower.includes('cara jual') || queryLower.includes('jual barang') || queryLower.includes('pasang iklan')) {
    return 'Untuk menjual barang di PresUMart gampang banget! Cukup klik menu Jual Barang di navigasi atas, isi nama produk, deskripsi, harga, dan foto dari HP kamu. Gratis khusus mahasiswa President University!';
  }

  if (queryLower.includes('cara beli') || queryLower.includes('bayar') || queryLower.includes('cod')) {
    return 'Pembelian di PresUMart menggunakan metode COD (Cash on Delivery) di area kampus President University (Student Center, Rektorat, Kantin, Asrama, dll). Kamu bisa langsung chat penjual atau pesan di kartu produk!';
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
      .map((p: any) => `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')} | Kategori: ${p.category} | Stok: ${p.stock ?? 1} | Nego: ${p.allowNego !== false ? 'Bisa' : 'Harga Pas'} | Penjual: ${p.seller || 'Mahasiswa'} (${p.sellerMajor || 'PresUniv'}, ${p.sellerBatch || '2023'}) | Deskripsi: ${p.description || ''}`)
      .join('\n');

    const systemPrompt = `Kamu adalah Asisten AI Pintar PresUMart, marketplace resmi khusus mahasiswa President University Jababeka.

Katalog Produk Aktif Saat Ini:
${productList || 'Belum ada produk.'}

Lokasi COD Kampus Resmi:
- Student Center President University
- Lobby Building A (Rektorat)
- Lobby Building B / C
- Kantin President University
- Dormitory Jababeka (Asrama)
- President Executive Club

Panduan Layanan PresUMart:
- Pembayaran & Pengiriman: Menggunakan COD (Cash on Delivery) langsung di kampus.
- Fitur Nego: Pembeli dapat mengajukan tawaran harga via fitur Chat/Nego di PresUMart.
- Registrasi/Login: Khusus email resmi kampus (@student.president.ac.id / @president.ac.id).
- Keamanan: Barang ilegal seperti rokok, vape, miras, judi, senjata api/tajam, & obat keras dilarang keras.

Instruksi Respons AI:
1. Jika pengguna mencari/bertanya produk, cocokkan dengan katalog di atas. Berikan rekomendasi yang paling tepat dengan menyebutkan nama produk, harga, status nego, dan info penjualnya secara ramah.
2. Jika pengguna mengekspresikan kebutuhan (misal: "lapar", "butuh laptop", "buku kuliah", "sepatu futsal", "peralatan kost"), pahami niatnya dan rekomendasikan produk dari kategori yang relevan.
3. Jika produk tidak ditemukan, jawab dengan sopan: "Waduh, produk yang kamu cari belum ada yang menjual saat ini di PresUMart 😅. Kamu bisa berkala cek lagi nanti, atau kamu bisa pasang iklan jual barang ini di menu Jual Barang!"
4. Gunakan bahasa Indonesia yang ramah, santun, hangat, dan membantu layaknya sesama mahasiswa President University.
5. DILARANG menggunakan format bintang markdown (seperti ** atau *). Tulis dalam format teks polos yang rapi.`;

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
      ],
      max_tokens: 600,
      temperature: 0.5,
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

    if (!reply || reply.includes('tidak memberikan tanggapan')) {
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
