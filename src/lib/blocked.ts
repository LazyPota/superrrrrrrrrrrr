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
  
  // Racun & Organ Manusia
  'racun', 'poison', 'cyanide', 'sianida', 'organ manusia', 'jual ginjal', 'kidney sale',
  
  // Konten Dewasa & Ilegal
  'porno', 'porn', 'adult content', 'bokep', 'dildo', 'counterfeit', 'fake id', 'ijazah palsu', 'stnk palsu',
  
  // Cheat & Hack Ilegal
  'cheat game', 'hack akun', 'crack software', 'exploit tool',

  // Kata Kasar & Penghinaan (Profanity & Vandalism)
  'goblok', 'goblog', 'tolol', 'bego', 'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'pepek', 'pantek', 'jancok', 'jancuk', 'asu', 'bajingan', 'kampang', 'somplak', 'idiot', 'sampah', 'sialan', 'keparat', 'silit', 'fuck', 'shit', 'bitch', 'asshole',

  // XSS & Script Injection Vectors
  '<script', '</script', 'javascript:', 'onerror=', 'onload=', 'eval(', '<iframe', '<svg', 'document.cookie', 'window.location',
];

export function isProductBlocked(name: string, description: string) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  return BLOCKED_TERMS.some(term => text.includes(term.toLowerCase()));
}

export function getBlockReason(name: string, description: string) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  const found = BLOCKED_TERMS.find(term => text.includes(term.toLowerCase()));
  if (!found) return null;
  return `❌ Produk Ditolak & Diblokir Otomatis! Mengandung kata terlarang / tidak sopan: "${found}". Produk ilegal, kata kasar, atau skrip berbahaya tidak diizinkan di PresUMart.`;
}
