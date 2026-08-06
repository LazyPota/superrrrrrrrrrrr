import { User, Product, DirectMessage, Reply } from '../types';

const STORAGE_KEYS = {
  USER: 'presumart_user',
  USERS: 'presumart_users',
  PRODUCTS: 'presumart_products',
  DIRECT_MESSAGES: 'presumart_direct_messages',
  REVIEWS: 'presumart_reviews',
  WISHLIST: 'presumart_wishlist',
};

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

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h' + hash.toString(36);
}

const SEED_USERS = [
  {
    name: 'Rina S.',
    email: 'rina.s@student.president.ac.id',
    password: hashPassword('password123'),
    major: 'Actuarial Science',
    batch: '2023',
  },
  {
    name: 'Ahmad R.',
    email: 'ahmad.r@student.president.ac.id',
    password: hashPassword('password123'),
    major: 'Information Technology',
    batch: '2026',
  },
];

function getUsers() {
  if (typeof window === 'undefined') return SEED_USERS;
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_USERS;
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

    if (serverDb.products && serverDb.products.length > 0) {
      const localProds = getProducts();
      const mergedMap = new Map();
      localProds.forEach(p => mergedMap.set(p.id, p));
      serverDb.products.forEach(p => mergedMap.set(p.id, p));
      const mergedProds = Array.from(mergedMap.values());
      if (mergedProds.length !== localProds.length) {
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
          const mergedReplies = Array.from(replyMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          mergedMap.set(incoming.id, {
            ...existing,
            ...incoming,
            replies: mergedReplies,
          });
        }
      });

      const mergedMsgs = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (JSON.stringify(mergedMsgs) !== JSON.stringify(localMsgs)) {
        localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(mergedMsgs));
        updated = true;

        if (currentUser) {
          const newUnread = mergedMsgs.filter(m => (m.sellerEmail === currentUser.email && m.unreadBySeller) || (m.buyerEmail === currentUser.email && m.unreadByBuyer)).length;
          const newRepliesCount = mergedMsgs.reduce((acc, m) => acc + (m.replies ? m.replies.length : 0), 0);

          if (newUnread > localUnread || newRepliesCount > localRepliesCount) {
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
        users: getUsers(),
        products: getProducts(),
        messages: getDirectMessages(),
      }),
    });
  } catch (e) {
    // Ignore network errors
  }
}

export function registerUser(user) {
  const users = getUsers();
  const exists = users.find(u => u.email === user.email);
  if (exists) return { ok: false, error: 'Email sudah terdaftar.' };
  const newUser = {
    name: user.name,
    email: user.email,
    password: hashPassword(user.password),
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

export function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return { ok: false, error: 'Akun tidak ditemukan. Silakan daftar dulu.' };
  if (user.password !== hashPassword(password)) return { ok: false, error: 'Password salah.' };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // BUG FIX #1: Migrate guest cart to user cart on login
    migrateGuestCart(user.email);
  }
  return { ok: true, user };
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
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
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  pushToServer();
}

export function addProduct(product) {
  const products = getProducts();
  products.push({ ...product, id: Date.now().toString(), createdAt: new Date().toISOString() });
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
  return data ? JSON.parse(data) : [];
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

export function getDirectMessages() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES);
  return data ? JSON.parse(data) : [];
}

export function saveDirectMessages(messages) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(messages));
  pushToServer();
}

export function sendDirectMessage({ sellerEmail, sellerName, buyerEmail, buyerName, productId, productName, productPrice, proposedPrice, messageText, type = 'nego' }) {
  const messages = getDirectMessages();
  const newMsg = {
    id: Date.now().toString(),
    sellerEmail,
    sellerName,
    buyerEmail,
    buyerName,
    productId,
    productName,
    productPrice,
    proposedPrice,
    messageText,
    type,
    status: 'pending',
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
  return newMsg;
}

export function addReplyToMessage(messageId, senderEmail, senderName, text) {
  const messages = getDirectMessages();
  const msg = messages.find(m => m.id === messageId);
  if (msg) {
    if (!msg.replies) msg.replies = [];
    msg.replies.push({
      id: Date.now().toString(),
      senderEmail,
      senderName,
      text: text.trim(),
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
  }
  return messages;
}

export function updateMessageStatus(id, status) {
  const messages = getDirectMessages();
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.status = status;
    msg.unreadByBuyer = true;
    saveDirectMessages(messages);
    playOrderSound();
    if (status === 'accepted') {
      speakVoice('Orderan disetujui!');
    } else if (status === 'rejected') {
      speakVoice('Orderan ditolak!');
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
  return data ? JSON.parse(data) : [];
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
    id: 'rev-' + Date.now(),
    productId: data.productId,
    productName: data.productName,
    sellerEmail: data.sellerEmail,
    buyerEmail: data.buyerEmail,
    buyerName: data.buyerName,
    rating: data.rating,
    comment: data.comment,
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
  return data ? JSON.parse(data) : [];
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
