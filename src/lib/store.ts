import { User, Product, DirectMessage, Reply } from '../types';

const STORAGE_KEYS = {
  USER: 'presumart_user',
  USERS: 'presumart_users',
  PRODUCTS: 'presumart_products_v3',
  DIRECT_MESSAGES: 'presumart_direct_messages',
  REVIEWS: 'presumart_reviews',
  WISHLIST: 'presumart_wishlist',
};

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('presumart_products');
    localStorage.removeItem('presumart_products_v2');
  } catch(e) {}
}

export function speakVoice(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.25; // Pitch cewe

    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech error:', e);
  }
}

export function playOrderSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playNote(587.33, 0, 0.15);
    playNote(880, 0.15, 0.35);

    // Close AudioContext after notes finish to prevent memory leak
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

// SECURITY: Sanitize user input to prevent XSS
function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SECURITY: Generate cryptographically secure unique IDs
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

// SECURITY: SHA-256 password hashing (replaces weak Java hashCode)
async function hashPasswordAsync(password: string): Promise<string> {
  if (typeof window === 'undefined' || !crypto?.subtle) {
    // Fallback for SSR or old environments — still stronger than old hash
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash + password.charCodeAt(i)) >>> 0;
    }
    return 'hf' + hash.toString(36);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_presumart_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SECURITY: Synchronous hash for backward compatibility during migration
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h' + hash.toString(36);
}

const SEED_USERS: any[] = [];

function getUsers() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  pushToServer();
}

export async function syncWithServer() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return;
    const serverDb = await res.json();
    
    let updated = false;

    if (serverDb.products) {
      const localProds = getProducts();
      const mergedMap = new Map();
      localProds.forEach(p => mergedMap.set(p.id, p));
      serverDb.products.forEach((p: any) => mergedMap.set(p.id, p));
      const mergedProds = Array.from(mergedMap.values()).filter((p: any) => p && p.id && !p.id.startsWith('seed-') && !p.id.startsWith('prod-presu-'));
      if (JSON.stringify(mergedProds) !== JSON.stringify(localProds)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mergedProds));
        updated = true;
      }
    }

    if (serverDb.messages) {
      const localMsgs = getDirectMessages();
      const currentUser = getUser();
      const localUnread = currentUser ? localMsgs.filter(m => (m.sellerEmail === currentUser.email && m.unreadBySeller) || (m.buyerEmail === currentUser.email && m.unreadByBuyer)).length : 0;
      const localRepliesCount = localMsgs.reduce((acc, m) => acc + (m.replies ? m.replies.length : 0), 0);

      const mergedMap = new Map();
      localMsgs.forEach(m => mergedMap.set(m.id, { ...m }));

      serverDb.messages.forEach(incoming => {
        const existing = mergedMap.get(incoming.id);
        if (!existing) {
          mergedMap.set(incoming.id, { ...incoming });
        } else {
          const replyMap = new Map();
          (existing.replies || []).forEach(r => replyMap.set(r.id, r));
          (incoming.replies || []).forEach(r => replyMap.set(r.id, r));
          const mergedReplies = Array.from(replyMap.values()).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          mergedMap.set(incoming.id, {
            ...existing,
            ...incoming,
            replies: mergedReplies,
          });
        }
      });

      const mergedMsgs = Array.from(mergedMap.values()).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (JSON.stringify(mergedMsgs) !== JSON.stringify(localMsgs)) {
        localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(mergedMsgs));
        updated = true;
      }

      if (currentUser) {
        const notifiedIdsStr = typeof window !== 'undefined' ? (localStorage.getItem('presumart_notified_ids') || '[]') : '[]';
        let notifiedIds: string[] = [];
        try { notifiedIds = JSON.parse(notifiedIdsStr); } catch (e) { notifiedIds = []; }
        const notifiedSet = new Set(notifiedIds);
        let hasTrulyNewIncoming = false;

        mergedMsgs.forEach(m => {
          // Check if thread is sent to current user by someone else
          if (m.sellerEmail === currentUser.email && m.buyerEmail !== currentUser.email) {
            if (!notifiedSet.has(m.id)) {
              hasTrulyNewIncoming = true;
              notifiedSet.add(m.id);
            }
          }
          // Check replies sent by someone else
          (m.replies || []).forEach((r: any) => {
            if (r.senderEmail !== currentUser.email && !notifiedSet.has(r.id)) {
              hasTrulyNewIncoming = true;
              notifiedSet.add(r.id);
            }
          });
        });

        if (hasTrulyNewIncoming) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('presumart_notified_ids', JSON.stringify(Array.from(notifiedSet).slice(-200)));
            window.dispatchEvent(new CustomEvent('new-incoming-message'));
          }
        }
      }
    }

    if (updated) {
      window.dispatchEvent(new CustomEvent('messages-updated'));
    }
  } catch (e) {
    // Ignore network errors
  }
}

export async function pushToServer() {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // SECURITY: Do NOT send user data (contains passwords) to server
        products: getProducts(),
        messages: getDirectMessages(),
      }),
    });
  } catch (e) {
    // Ignore network errors
  }
}

export async function registerUser(user) {
  const users = getUsers();
  const exists = users.find(u => u.email === user.email);
  if (exists) return { ok: false, error: 'Email sudah terdaftar.' };
  const hashedPw = await hashPasswordAsync(user.password);
  const newUser = {
    name: sanitizeInput(user.name),
    email: user.email.trim().toLowerCase(),
    password: hashedPw,
    major: user.major,
    batch: user.batch,
  };
  users.push(newUser);
  saveUsers(users);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    // BUG FIX #1: Migrate guest cart to user cart on register
    migrateGuestCart(newUser.email);
  }
  return { ok: true, user: newUser };
}

export async function loginUser(email: string, password: string) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return { ok: false, error: 'Akun tidak ditemukan. Silakan daftar dulu.' };
  // SECURITY: Check both old hash (migration) and new SHA-256 hash
  const newHash = await hashPasswordAsync(password);
  const oldHash = hashPassword(password);
  if (user.password !== newHash && user.password !== oldHash) {
    return { ok: false, error: 'Password salah.' };
  }
  // SECURITY: Auto-migrate old hash to new SHA-256 hash
  if (user.password === oldHash && user.password !== newHash) {
    user.password = newHash;
    const allUsers = getUsers().map(u => u.email === user.email ? user : u);
    saveUsers(allUsers);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // BUG FIX #1: Migrate guest cart to user cart on login
    migrateGuestCart(user.email);
  }
  return { ok: true, user };
}

export async function updateUserProfile(currentEmail: string, updatedFields: { name?: string; email?: string; password?: string; major?: string; batch?: string }) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === currentEmail);
  if (userIndex === -1) return { ok: false, error: 'User tidak ditemukan.' };

  const currentUser = { ...users[userIndex] };

  // If email is changing, validate domain and uniqueness
  if (updatedFields.email && updatedFields.email !== currentEmail) {
    const newEmail = updatedFields.email.trim().toLowerCase();
    if (!newEmail.endsWith('@student.president.ac.id') && !newEmail.endsWith('@president.ac.id')) {
      return { ok: false, error: 'Email harus menggunakan domain resmi @student.president.ac.id atau @president.ac.id' };
    }
    const emailExists = users.some(u => u.email === newEmail && u.email !== currentEmail);
    if (emailExists) {
      return { ok: false, error: 'Email tersebut sudah digunakan oleh akun lain.' };
    }
    currentUser.email = newEmail;
  }

  if (updatedFields.name) currentUser.name = sanitizeInput(updatedFields.name);
  if (updatedFields.major) currentUser.major = updatedFields.major;
  if (updatedFields.batch) currentUser.batch = updatedFields.batch;

  if (updatedFields.password && updatedFields.password.trim() !== '') {
    currentUser.password = await hashPasswordAsync(updatedFields.password);
  }

  users[userIndex] = currentUser;
  saveUsers(users);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }

  return { ok: true, user: currentUser };
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function removeUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getProducts() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    // Force purge any old seed / prototype items
    const userOnly = list.filter((p: any) => p && p.id && !p.id.startsWith('seed-') && !p.id.startsWith('prod-presu-'));
    if (userOnly.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(userOnly));
    }
    return userOnly;
  } catch (e) {
    return [];
  }
}

export function saveProducts(products) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  pushToServer();
}

export function addProduct(product) {
  const products = getProducts();
  // SECURITY: Sanitize user input and use secure ID
  products.push({
    ...product,
    id: generateId(),
    name: sanitizeInput(product.name),
    description: sanitizeInput(product.description),
    createdAt: new Date().toISOString(),
  });
  saveProducts(products);
  return products;
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  return products;
}

export function updateProduct(id: string, updates: any) {
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProducts(products);
  return products;
}

export function reduceProductStock(id: string, qtyPurchased: number) {
  const products = getProducts();
  const updated = products.map(p => {
    if (p.id === id) {
      const currentStock = p.stock !== undefined ? p.stock : 1;
      const newStock = Math.max(0, currentStock - qtyPurchased);
      return { ...p, stock: newStock };
    }
    return p;
  });
  saveProducts(updated);
  return updated;
}

/* --- ISOLATED CART PER USER (BUG FIX #1) --- */

function getCartKey() {
  const user = getUser();
  return user ? `presumart_cart_${user.email}` : 'presumart_cart_guest';
}

// BUG FIX #1: Migrate guest cart items to user's personal cart after login/register
function migrateGuestCart(userEmail) {
  if (typeof window === 'undefined') return;
  const guestData = localStorage.getItem('presumart_cart_guest');
  if (!guestData) return;
  try {
    const guestItems = JSON.parse(guestData);
    if (guestItems.length === 0) return;

    const userKey = `presumart_cart_${userEmail}`;
    const userData = localStorage.getItem(userKey);
    const userItems = userData ? JSON.parse(userData) : [];

    guestItems.forEach(guestItem => {
      const existing = userItems.find(i => i.id === guestItem.id);
      if (existing) {
        existing.qty += guestItem.qty;
      } else {
        userItems.push(guestItem);
      }
    });

    localStorage.setItem(userKey, JSON.stringify(userItems));
    localStorage.removeItem('presumart_cart_guest');
  } catch (e) {
    // Ignore parse errors
  }
}

export function getCart() {
  if (typeof window === 'undefined') return [];
  const key = getCartKey();
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  const key = getCartKey();
  localStorage.setItem(key, JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  // BUG FIX #7: Dispatch event so Navbar badge can update without full page reload
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
  return cart;
}

export function updateCartQty(productId, qty) {
  if (qty < 1) return removeFromCart(productId);
  const cart = getCart().map(item => item.id === productId ? { ...item, qty } : item);
  saveCart(cart);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
  return cart;
}

export function clearCart() {
  saveCart([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
  return [];
}

/* --- DIRECT MESSAGES & LIVE INTERACTIVE CHAT SYSTEM --- */

let chatChannel: any = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    chatChannel = new BroadcastChannel('presumart_chat_channel');
    chatChannel.onmessage = (event: any) => {
      if (event.data && event.data.type === 'NEW_MESSAGE') {
        syncWithServer().then(() => {
          window.dispatchEvent(new CustomEvent('messages-updated'));
        });
      }
    };
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.DIRECT_MESSAGES) {
      window.dispatchEvent(new CustomEvent('messages-updated'));
    }
  });
}

function notifyChatSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('messages-updated'));
    if (chatChannel) {
      try { chatChannel.postMessage({ type: 'NEW_MESSAGE' }); } catch (e) {}
    }
  }
}

export function getDirectMessages() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveDirectMessages(messages: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(messages));
  pushToServer();
  notifyChatSync();
}

export function sendDirectMessage({ sellerEmail, sellerName, buyerEmail, buyerName, productId, productName, productPrice, proposedPrice, messageText, type = 'inquiry', status = 'chat', codLocation = '' }: any) {
  const messages = getDirectMessages();
  const initialStatus = status || (type === 'order' ? 'pending' : (type === 'nego' ? 'pending' : 'chat'));
  const newMsg = {
    id: generateId(),
    sellerEmail,
    sellerName: sanitizeInput(sellerName),
    buyerEmail,
    buyerName: sanitizeInput(buyerName),
    productId,
    productName: sanitizeInput(productName),
    productPrice,
    proposedPrice,
    messageText: sanitizeInput(messageText),
    type,
    status: initialStatus,
    codLocation: sanitizeInput(codLocation),
    paymentMethod: 'COD',
    createdAt: new Date().toISOString(),
    unreadBySeller: true,
    unreadByBuyer: false,
    replies: [],
  };
  messages.push(newMsg);
  saveDirectMessages(messages);
  playOrderSound();
  if (type === 'order') {
    speakVoice('Orderan berhasil!');
  } else if (type === 'nego') {
    speakVoice('Nego terkirim!');
  } else {
    speakVoice('Pesan terkirim!');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('messages-updated'));
  }
  return newMsg;
}

export function addReplyToMessage(messageId: string, senderEmail: string, senderName: string, text: string) {
  const messages = getDirectMessages();
  const msg = messages.find(m => m.id === messageId);
  if (msg) {
    if (!msg.replies) msg.replies = [];
    msg.replies.push({
      id: generateId(),
      senderEmail,
      senderName: sanitizeInput(senderName),
      text: sanitizeInput(text.trim()),
      timestamp: new Date().toISOString(),
    });

    if (senderEmail === msg.sellerEmail) {
      msg.unreadByBuyer = true;
    } else {
      msg.unreadBySeller = true;
    }

    saveDirectMessages(messages);
    playOrderSound();
    speakVoice('Pesan terkirim!');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('messages-updated'));
    }
  }
  return messages;
}

export function updateMessageStatus(id: string, status: string, codLocation?: string) {
  const messages = getDirectMessages();
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.status = status;
    if (codLocation) {
      msg.codLocation = codLocation;
    }
    msg.unreadByBuyer = true;
    msg.unreadBySeller = true;
    saveDirectMessages(messages);
    playOrderSound();
    if (status === 'accepted') {
      speakVoice('Orderan disetujui!');
    } else if (status === 'rejected') {
      speakVoice('Orderan ditolak!');
    } else if (status === 'offered') {
      speakVoice('Penawaran produk dikirim!');
    } else if (status === 'completed') {
      speakVoice('Barang telah diterima!');
    } else if (status === 'sold') {
      speakVoice('Barang sudah terjual!');
    }
  }
  return messages;
}

export function markMessagesAsRead(userEmail) {
  const messages = getDirectMessages();
  let updated = false;
  messages.forEach(m => {
    if (m.sellerEmail === userEmail && m.unreadBySeller) {
      m.unreadBySeller = false;
      updated = true;
    }
    if (m.buyerEmail === userEmail && m.unreadByBuyer) {
      m.unreadByBuyer = false;
      updated = true;
    }
  });
  if (updated) {
    saveDirectMessages(messages);
  }
}

/* --- REVIEWS & RATINGS SYSTEM --- */

export function getReviews(): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveReviews(reviews: any[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  pushToServer();
}

export function addReview(data: {
  messageId: string;
  productId: string;
  productName: string;
  sellerEmail: string;
  buyerEmail: string;
  buyerName: string;
  rating: number;
  comment: string;
}) {
  const reviews = getReviews();
  const newReview = {
    id: 'rev-' + generateId(),
    productId: data.productId,
    productName: sanitizeInput(data.productName),
    sellerEmail: data.sellerEmail,
    buyerEmail: data.buyerEmail,
    buyerName: sanitizeInput(data.buyerName),
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    comment: sanitizeInput(data.comment),
    createdAt: new Date().toISOString(),
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  // Mark message as reviewed
  const messages = getDirectMessages();
  const msg = messages.find(m => m.id === data.messageId);
  if (msg) {
    msg.reviewed = true;
    saveDirectMessages(messages);
  }

  playOrderSound();
  speakVoice('Ulasan berhasil dikirim!');
  return reviews;
}

export function getProductReviews(productId: string): any[] {
  return getReviews().filter(r => r.productId === productId);
}

export function getSellerReviews(sellerEmail: string): any[] {
  return getReviews().filter(r => r.sellerEmail === sellerEmail);
}

export function getSellerRating(sellerEmail: string): { avgRating: number; totalReviews: number } {
  const sellerRevs = getSellerReviews(sellerEmail);
  if (sellerRevs.length === 0) return { avgRating: 5.0, totalReviews: 0 };
  const sum = sellerRevs.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  const avg = (sum / sellerRevs.length).toFixed(1);
  return { avgRating: parseFloat(avg), totalReviews: sellerRevs.length };
}

/* --- WISHLIST / FAVORITES SYSTEM --- */

function getWishlistKey(): string {
  const user = getUser();
  return user ? `presumart_wishlist_${user.email}` : 'presumart_wishlist_guest';
}

export function getWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  const key = getWishlistKey();
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function toggleWishlist(productId: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = getWishlistKey();
  const list = getWishlist();
  const index = list.indexOf(productId);
  let isAdded = false;

  if (index >= 0) {
    list.splice(index, 1);
    isAdded = false;
  } else {
    list.push(productId);
    isAdded = true;
    speakVoice('Disimpan ke favorit!');
  }

  localStorage.setItem(key, JSON.stringify(list));
  return isAdded;
}

export function isWishlisted(productId: string): boolean {
  const list = getWishlist();
  return list.includes(productId);
}

/* --- DELETE MESSAGES SYSTEM --- */

export function deleteDirectMessageThread(messageId: string) {
  const user = getUser();
  const messages = getDirectMessages();
  const msg = messages.find((m: any) => m.id === messageId);
  if (msg) {
    if (user) {
      if (msg.buyerEmail === user.email) msg.deletedByBuyer = true;
      if (msg.sellerEmail === user.email) msg.deletedBySeller = true;
    }
    msg.deleted = true;
  }
  // Remove deleted ones from local array too
  const activeMessages = messages.filter((m: any) => !m.deleted && !(user && ((m.buyerEmail === user.email && m.deletedByBuyer) || (m.sellerEmail === user.email && m.deletedBySeller))));
  saveDirectMessages(messages);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('messages-updated'));
  }
  return activeMessages;
}

export function deleteMessageReply(threadId: string, replyId: string) {
  const messages = getDirectMessages();
  const msg = messages.find((m: any) => m.id === threadId);
  if (msg && msg.replies) {
    msg.replies = msg.replies.filter((r: any) => r.id !== replyId);
    saveDirectMessages(messages);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('messages-updated'));
    }
  }
  return messages;
}
