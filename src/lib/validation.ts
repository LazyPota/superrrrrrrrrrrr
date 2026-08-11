import CATEGORIES from '../data/categories';
import MAJORS from './majors';
import { isTextBlocked } from './blocked';

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
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

export function isValidMajor(major: string): boolean {
  if (!major || typeof major !== 'string') return false;
  return MAJORS.includes(major.trim());
}

export function isValidBatch(batch: string | number): boolean {
  const b = String(batch || '').trim();
  const num = parseInt(b, 10);
  return Number.isInteger(num) && num >= 2015 && num <= 2030;
}

// ──── Validate User Profile / Account ─────────────────────────
export function validateUserProfile(userData: Record<string, unknown>): { valid: boolean; errors: string[]; sanitized?: Record<string, any> } {
  const errors: string[] = [];

  const name = typeof userData.name === 'string' ? sanitizeText(userData.name.trim()) : '';
  if (!name || name.length < 2) {
    errors.push('Nama minimal 2 karakter.');
  } else if (name.length > 50) {
    errors.push('Nama maksimal 50 karakter.');
  } else if (isTextBlocked(name)) {
    errors.push('Nama mengandung kata tidak sopan / terlarang.');
  }

  const email = typeof userData.email === 'string' ? userData.email.trim().toLowerCase() : '';
  if (!email.endsWith('@student.president.ac.id') && !email.endsWith('@president.ac.id')) {
    errors.push('Email harus menggunakan domain resmi @student.president.ac.id atau @president.ac.id');
  }

  const major = typeof userData.major === 'string' ? userData.major.trim() : '';
  if (!isValidMajor(major)) {
    errors.push(`Major / Program Studi "${major}" tidak valid. Hanya major resmi President University yang diizinkan.`);
  }

  const batch = String(userData.batch || '').trim();
  if (!isValidBatch(batch)) {
    errors.push(`Angkatan / Batch "${batch}" tidak valid.`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitized: {
      ...userData,
      name,
      email,
      major,
      batch,
    },
  };
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

  // --- Seller Major (CRITICAL: Whitelist check) ---
  let sellerMajor = typeof product.sellerMajor === 'string' ? product.sellerMajor.trim() : '';
  if (sellerMajor && !isValidMajor(sellerMajor)) {
    errors.push(`Major penjual "${sellerMajor}" tidak valid. Hanya major resmi yang diizinkan.`);
  }

  // --- Seller Batch (CRITICAL: Batch check) ---
  let sellerBatch = String(product.sellerBatch || '').trim();
  if (sellerBatch && !isValidBatch(sellerBatch)) {
    errors.push(`Angkatan penjual "${sellerBatch}" tidak valid.`);
  }

  const sellerName = typeof product.seller === 'string' ? sanitizeText(product.seller.trim()).slice(0, 50) : '';

  // If valid, return sanitized data
  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      sanitized: {
        ...product,
        name: sanitizeText(name),
        description: sanitizeText(description),
        price: Math.round(price),
        category,
        stock: Math.round(Math.max(STOCK_MIN, Math.min(STOCK_MAX, stock))),
        condition,
        sellerEmail,
        seller: sellerName || product.seller,
        sellerMajor: sellerMajor || product.sellerMajor || 'Informatics',
        sellerBatch: sellerBatch || product.sellerBatch || '2024',
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
