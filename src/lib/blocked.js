const BLOCKED_TERMS = [
  'narkoba', 'drugs', 'ganja', 'marijuana', 'cocaine', 'heroin', 'sabu',
  'senjata', 'weapon', 'gun', 'pistol', 'senapan', 'peluru', 'amunisi',
  'bom', 'bomb', 'explosive', 'petasan', 'mercon',
  'racun', 'poison', 'cyanide', 'sianida',
  'organ', 'kidney', 'liver',
  'porno', 'porn', 'adult content',
  'counterfeit', 'palsu', 'fake id', 'ijazah palsu',
  'hack', 'crack', 'cheat', 'exploit',
  'judi', 'gambling', 'slot', 'togel',
  'miras', 'alkohol', 'alcohol', 'liquor',
  'rokok', 'vape', 'cigarette',
];

export function isProductBlocked(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  return BLOCKED_TERMS.some(term => text.includes(term));
}

export function getBlockReason(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  const found = BLOCKED_TERMS.find(term => text.includes(term));
  if (!found) return null;
  return `Produk mengandung kata terlarang: "${found}". Produk berbahaya, ilegal, atau tidak pantas tidak diizinkan di PresUMart.`;
}
