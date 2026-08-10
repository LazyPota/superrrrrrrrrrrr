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
];

export function isProductBlocked(name: string, description: string) {
  const text = `${name} ${description}`.toLowerCase();
  return BLOCKED_TERMS.some(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

export function getBlockReason(name: string, description: string) {
  const text = `${name} ${description}`.toLowerCase();
  const found = BLOCKED_TERMS.find(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
  if (!found) return null;
  return `❌ Produk Ditolak & Diblokir Otomatis! Mengandung kata/barang terlarang: "${found}". Barang berbahaya seperti judi, alkohol, narkoba, senjata, rokok, atau produk ilegal tidak diizinkan di PresUMart.`;
}
