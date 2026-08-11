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
  'goblok', 'goblog', 'tolol', 'bego', 'blegug',
  'anjing', 'anjg', 'anjir', 'ajg', 'anying',
  'babi', 'bangsat', 'bngst', 'bgst',
  'kontol', 'kntl', 'konthol', 'konthl',
  'memek', 'mmk', 'pepek', 'ppk',
  'pantek', 'pntek', 'pantek',
  'jancok', 'jancuk', 'jnck', 'cok', 'jancik',
  'asu', 'asw',
  'bajingan', 'kampang', 'somplak',
  'idiot', 'sialan', 'keparat',
  'silit', 'kimak', 'perek', 'sundal', 'celeng', 'monyet',
  'tai', 'taik', 'tahi',
  'ngentot', 'ngewe', 'entot', 'ewean',
  'tetek', 'toket',
  'biadab', 'keparat',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'bastard', 'cunt', 'nigger', 'nigga',
  'bunuh', 'membunuh', 'dibunuh', 'pembunuh',

  // XSS & Script Injection Vectors
  '<script', '</script', 'javascript:', 'onerror=', 'onload=', 'eval(', '<iframe', '<svg', 'document.cookie', 'window.location',
];

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.\-_\s,;:!?*#@()[\]{}|~`'"]+/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/€/g, 'e');
}

export function isTextBlocked(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const normalized = normalizeText(text);
  return BLOCKED_TERMS.some(term => {
    const termLower = term.toLowerCase();
    if (lower.includes(termLower)) return true;
    const termNormalized = normalizeText(term);
    if (termNormalized.length >= 3 && normalized.includes(termNormalized)) return true;
    return false;
  });
}

export function isProductBlocked(name: string, description: string, seller?: string): boolean {
  return isTextBlocked(name) || isTextBlocked(description) || isTextBlocked(seller || '');
}

export function getBlockReason(name: string, description: string, seller?: string): string | null {
  const fields = [
    { label: 'nama produk', value: name },
    { label: 'deskripsi', value: description },
    { label: 'nama penjual', value: seller || '' },
  ];
  for (const field of fields) {
    if (isTextBlocked(field.value)) {
      return `❌ Produk Ditolak & Diblokir Otomatis! Field "${field.label}" mengandung kata terlarang / tidak sopan. Produk ilegal, kata kasar, atau skrip berbahaya tidak diizinkan di PresUMart.`;
    }
  }
  return null;
}

