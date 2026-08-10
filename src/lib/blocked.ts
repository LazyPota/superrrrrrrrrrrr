const BLOCKED_TERMS = [
  // Narkotika & Obat Terlarang
  'narkoba', 'drugs', 'ganja', 'marijuana', 'cocaine', 'heroin', 'sabu', 'ekstasi', 'inex', 'tramadol', 'koplo', 'kratom', 'obat keras', 'resep dokter',
  
  // Judi & Slot Online
  'judi', 'gambling', 'slot online', 'slot gacor', 'slot zeus', 'togel', 'judol', 'zeus maxwin', 'gacor maxwin', 'taruhan online', 'poker judi', 'domino qiu', 'pragmatic play',
  
  // Minuman Keras & Alkohol
  'miras', 'alkohol', 'alcohol', 'liquor', 'beer', 'bir bintang', 'vodka', 'wine', 'ciu', 'arak', 'soju', 'whisky', 'whiskey', 'spirits',
  
  // Rokok & Vape
  'rokok', 'vape', 'cigarette', 'e-cigarette', 'liquid vape', 'cerutu', 'tobacco',
  
  // Senjata & Bahan Peledak
  'senjata api', 'weapon', 'gun', 'pistol', 'senapan', 'peluru', 'amunisi', 'bom', 'explosive', 'petasan', 'mercon', 'clurit', 'celurit', 'pisau lipat',
  
  // Racun & Organ Manusia / Kejahatan
  'racun', 'poison', 'cyanide', 'sianida', 'organ manusia', 'jual ginjal', 'kidney sale', 'santet', 'bunuh', 'pembunuh', 'pelet', 'voodoo', 'begal',
  
  // Konten Dewasa & Ilegal
  'porno', 'porn', 'adult content', 'bokep', 'dildo', 'counterfeit', 'fake id', 'ijazah palsu', 'stnk palsu',
  
  // Cheat & Hack Ilegal
  'cheat game', 'hack akun', 'crack software', 'exploit tool',

  // SARA, Kata Kasar & Ujaran Kebencian
  'anjing', 'kontol', 'ngentod', 'goblok', 'fuck', 'fucking', 'idiot', 'memek', 'pepek', 'babi', 'jancok', 'bangsat', 'biadab', 'perek', 'lonte', 'tolol'
];

export function isProductBlocked(name: string = '', description: string = '', sellerName: string = '', price?: number): boolean {
  // 1. Check invalid or negative/unrealistic price
  if (price !== undefined) {
    if (typeof price !== 'number' || isNaN(price) || price < 100 || price > 500000000) {
      return true;
    }
  }

  // 2. Check for spammy / repeated character patterns (12+ repeated chars)
  const fullText = `${name} ${description} ${sellerName}`.toLowerCase();
  if (/(.)\1{11,}/.test(fullText)) {
    return true;
  }

  // 3. Check for blocked terms / profanity
  return BLOCKED_TERMS.some(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(fullText);
  });
}

export function getBlockReason(name: string = '', description: string = '', sellerName: string = '', price?: number): string | null {
  if (price !== undefined) {
    if (typeof price !== 'number' || isNaN(price) || price < 100) {
      return '❌ Harga tidak valid! Harga minimal produk adalah Rp 100 dan tidak boleh bernilai negatif.';
    }
    if (price > 500000000) {
      return '❌ Harga melebihi batas maksimum (Maksimal Rp 500.000.000).';
    }
  }

  const fullText = `${name} ${description} ${sellerName}`.toLowerCase();

  if (/(.)\1{11,}/.test(fullText)) {
    return '❌ Postingan ditolak! Terdeteksi karakter berulang / spamming.';
  }

  const found = BLOCKED_TERMS.find(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(fullText);
  });

  if (!found) return null;
  return `❌ Produk Ditolak & Diblokir Otomatis! Mengandung kata/konten dilarang: "${found}". Mohon gunakan kata-kata yang sopan dan sesuai aturan.`;
}

