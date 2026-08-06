const BLOCKED_TERMS = [
  // Narkotika & Obat Terlarang
  'narkoba', 'drugs', 'ganja', 'marijuana', 'cocaine', 'heroin', 'sabu', 'ekstasi', 'inex', 'tramadol', 'koplo', 'kratom', 'obat keras', 'resep dokter',
  
  // Judi & Slot Online
  'judi', 'gambling', 'slot', 'togel', 'judol', 'zeus', 'gacor', 'maxwin', 'taruhan', 'poker', 'domino qiu', 'pragmatic',
  
  // Minuman Keras & Alkohol
  'miras', 'alkohol', 'alcohol', 'liquor', 'beer', 'bir', 'vodka', 'wine', 'ciu', 'arak', 'soju', 'whisky', 'whiskey', 'spirits', 'whisky',
  
  // Rokok & Vape
  'rokok', 'vape', 'cigarette', 'e-cigarette', 'pod', 'liquid vape', 'cerutu', 'tobacco',
  
  // Senjata & Bahan Peledak
  'senjata', 'weapon', 'gun', 'pistol', 'senapan', 'peluru', 'amunisi', 'bom', 'bomb', 'explosive', 'petasan', 'mercon', 'clurit', 'celurit', 'samurai', 'pisau lipat',
  
  // Racun & Organ
  'racun', 'poison', 'cyanide', 'sianida', 'organ', 'kidney', 'ginjal',
  
  // Konten Dewasa & Ilegal
  'porno', 'porn', 'adult content', 'bokep', 'dildo', 'counterfeit', 'palsu', 'fake id', 'ijazah palsu', 'stnk palsu',
  
  // Cheat & Hack
  'hack', 'crack', 'cheat', 'exploit',
];

export function isProductBlocked(name: string, description: string) {
  const text = `${name} ${description}`.toLowerCase();
  return BLOCKED_TERMS.some(term => text.includes(term));
}

export function getBlockReason(name: string, description: string) {
  const text = `${name} ${description}`.toLowerCase();
  const found = BLOCKED_TERMS.find(term => text.includes(term));
  if (!found) return null;
  return `❌ Produk Ditolak & Diblokir Otomatis! Mengandung kata/barang terlarang: "${found}". Barang berbahaya seperti judi, alkohol, narkoba, senjata, rokok, atau produk ilegal tidak diizinkan di PresUMart.`;
}
