import CATEGORIES from '../data/categories';

export const PRICE_MIN = 100;
export const PRICE_MAX = 999_999_999;
export const STOCK_MIN = 0;
export const STOCK_MAX = 9999;
export const NAME_MAX_LENGTH = 200;
export const DESC_MAX_LENGTH = 2000;

export const VALID_CONDITIONS = [
  'Baru',
  'Barang Baru',
  'Bekas - Like New',
  'Bekas - Good',
  'Bekas - Fair',
  'Bekas - Mulus',
  'Bekas - Butuh Perbaikan',
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: Record<string, unknown>;
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// ──── Validate a single product ───────────────────────────────
export function validateProduct(product: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!product || typeof product !== 'object') {
    return { valid: false, errors: ['Product data is invalid or missing.'] };
  }

  // --- Name ---
  const name = typeof product.name === 'string' ? product.name.trim() : '';
  if (!name || name.length === 0) {
    errors.push('Nama produk wajib diisi.');
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.push(`Nama produk maksimal ${NAME_MAX_LENGTH} karakter.`);
  }

  // --- Description ---
  const description = typeof product.description === 'string' ? product.description.trim() : '';
  if (!description || description.length === 0) {
    errors.push('Deskripsi produk wajib diisi.');
  } else if (description.length > DESC_MAX_LENGTH) {
    errors.push(`Deskripsi produk maksimal ${DESC_MAX_LENGTH} karakter.`);
  }

  // --- Price (CRITICAL: prevent negative/zero prices) ---
  const price = Number(product.price);
  if (!Number.isFinite(price) || isNaN(price)) {
    errors.push('Harga produk tidak valid.');
  } else if (price < PRICE_MIN) {
    errors.push(`Harga minimum adalah Rp ${PRICE_MIN.toLocaleString('id-ID')}.`);
  } else if (price > PRICE_MAX) {
    errors.push(`Harga maksimum adalah Rp ${PRICE_MAX.toLocaleString('id-ID')}.`);
  } else if (!Number.isInteger(price)) {
    errors.push('Harga harus berupa bilangan bulat (tanpa desimal).');
  }

  // --- Category (CRITICAL: whitelist-only, no custom categories) ---
  const category = typeof product.category === 'string' ? product.category.trim() : '';
  if (!category) {
    errors.push('Kategori produk wajib dipilih.');
  } else if (!CATEGORIES.includes(category)) {
    errors.push(`Kategori "${category}" tidak valid. Hanya kategori resmi yang diizinkan.`);
  }

  // --- Stock ---
  const stock = Number(product.stock !== undefined ? product.stock : 1);
  if (!Number.isFinite(stock) || isNaN(stock)) {
    errors.push('Stok produk tidak valid.');
  } else if (stock < STOCK_MIN) {
    errors.push(`Stok minimum adalah ${STOCK_MIN}.`);
  } else if (stock > STOCK_MAX) {
    errors.push(`Stok maksimum adalah ${STOCK_MAX}.`);
  } else if (!Number.isInteger(stock)) {
    errors.push('Stok harus berupa bilangan bulat.');
  }

  // --- Condition ---
  const condition = typeof product.condition === 'string' ? product.condition.trim() : 'Bekas - Like New';
  if (!VALID_CONDITIONS.includes(condition)) {
    errors.push(`Kondisi "${condition}" tidak valid.`);
  }

  // --- Seller info ---
  const sellerEmail = typeof product.sellerEmail === 'string' ? product.sellerEmail.trim() : '';
  if (!sellerEmail || !sellerEmail.includes('@')) {
    errors.push('Email penjual tidak valid.');
  }

  // If valid, return sanitized data
  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      sanitized: {
        ...product,
        name: sanitizeText(name),
        description: sanitizeText(description),
        price: Math.round(price),               // Force integer
        category,                                // Whitelisted value
        stock: Math.round(Math.max(STOCK_MIN, Math.min(STOCK_MAX, stock))), // Clamped integer
        condition,
        sellerEmail,
        allowNego: product.allowNego === true || product.allowNego === undefined,
      },
    };
  }

  return { valid: false, errors };
}

// ──── Validate an array of products ───────────────────────────
export function validateProducts(products: unknown[]): {
  valid: Record<string, unknown>[];
  rejected: { index: number; errors: string[] }[];
} {
  const valid: Record<string, unknown>[] = [];
  const rejected: { index: number; errors: string[] }[] = [];

  if (!Array.isArray(products)) {
    return { valid: [], rejected: [{ index: -1, errors: ['Products is not an array.'] }] };
  }

  products.forEach((product, index) => {
    const result = validateProduct(product as Record<string, unknown>);
    if (result.valid && result.sanitized) {
      valid.push(result.sanitized);
    } else {
      rejected.push({ index, errors: result.errors });
    }
  });

  return { valid, rejected };
}
