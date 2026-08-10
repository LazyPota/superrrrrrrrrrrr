import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

let serverDb: {
  users: any[];
  products: any[];
  messages: any[];
  reviews: any[];
} = {
  users: [],
  products: [],
  messages: [],
  reviews: [],
};

function stripPasswords(users: any[]): any[] {
  return (users || []).map(({ password, ...rest }) => rest);
}

function mergeMessages(existingList: any[], incomingList: any[]) {
  const map = new Map();
  (existingList || []).forEach(m => map.set(m.id, { ...m }));

  (incomingList || []).forEach(incoming => {
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, { ...incoming });
    } else {
      const replyMap = new Map();
      (existing.replies || []).forEach((r: any) => replyMap.set(r.id, r));
      (incoming.replies || []).forEach((r: any) => replyMap.set(r.id, r));

      const mergedReplies = Array.from(replyMap.values()).sort((a: any, b: any) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        if (Math.abs(timeA - timeB) > 60000) {
          return timeA - timeB;
        }
        return 0;
      });
      const updatedStatus = incoming.status !== 'pending' ? incoming.status : existing.status;

      map.set(incoming.id, {
        ...existing,
        ...incoming,
        status: updatedStatus,
        deleted: incoming.deleted || existing.deleted,
        deletedByBuyer: incoming.deletedByBuyer || existing.deletedByBuyer,
        deletedBySeller: incoming.deletedBySeller || existing.deletedBySeller,
        reviewed: incoming.reviewed || existing.reviewed,
        replies: mergedReplies,
      });
    }
  });

  return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function mergeUsers(existingList: any[], incomingList: any[]) {
  const map = new Map();
  (existingList || []).forEach(u => map.set(u.email, u));
  (incomingList || []).forEach(u => map.set(u.email, u));
  return Array.from(map.values());
}

function mergeProducts(existingList: any[], incomingList: any[]) {
  const map = new Map();
  (existingList || []).forEach(p => map.set(p.id, { ...p }));

  (incomingList || []).forEach(incoming => {
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, { ...incoming });
    } else {
      const isSold = existing.status === 'sold' || incoming.status === 'sold' || existing.stock <= 0 || incoming.stock <= 0;
      const minStock = isSold ? 0 : Math.min(existing.stock ?? 1, incoming.stock ?? 1);
      map.set(incoming.id, {
        ...existing,
        ...incoming,
        stock: minStock,
        status: isSold ? 'sold' : (incoming.status || existing.status),
      });
    }
  });
  return Array.from(map.values());
}

function mergeReviews(existingList: any[], incomingList: any[]) {
  const map = new Map();
  (existingList || []).forEach(r => map.set(r.id, r));
  (incomingList || []).forEach(r => map.set(r.id, r));
  return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// In-memory rate limiter for /api/db (max 30 requests per minute per IP)
const dbRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkDbRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = dbRateLimitMap.get(ip);
  if (!limit || now > limit.resetTime) {
    dbRateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (limit.count >= 30) {
    return false;
  }
  limit.count += 1;
  return true;
}

export async function GET(req: Request) {
  const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkDbRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Too many GET requests' }, { status: 429 });
  }

  try {
    if (supabase) {
      const { data: supaUsers } = await supabase.from('users').select('*');
      const { data: supaProds } = await supabase.from('products').select('*');
      const { data: supaMsgs } = await supabase.from('messages').select('*');
      const { data: supaRevs } = await supabase.from('reviews').select('*');

      if (supaUsers && supaUsers.length > 0) {
        serverDb.users = mergeUsers(serverDb.users, supaUsers);
      }
      if (supaProds && supaProds.length > 0) {
        const cleanProds = supaProds.filter((p: any) => p && p.id && !p.id.startsWith('seed-') && !p.id.startsWith('prod-presu-'));
        serverDb.products = mergeProducts(serverDb.products, cleanProds);
      }
      if (supaMsgs && supaMsgs.length > 0) {
        serverDb.messages = mergeMessages(serverDb.messages, supaMsgs);
      }
      if (supaRevs && supaRevs.length > 0) {
        serverDb.reviews = mergeReviews(serverDb.reviews, supaRevs);
      }
    }
  } catch (e) {
    // Fallback if Supabase tables are not created yet
  }

  // Ensure serverDb products never contain dummy seed items
  serverDb.products = (serverDb.products || []).filter((p: any) => p && p.id && !p.id.startsWith('seed-') && !p.id.startsWith('prod-presu-'));

  // SECURITY: Strip passwords from user data before sending to client
  return NextResponse.json({
    ...serverDb,
    users: stripPasswords(serverDb.users),
  });
}

export async function POST(req: Request) {
  const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkDbRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Too many POST requests. Rate limit exceeded.' }, { status: 429 });
  }

  try {
    const data = await req.json();

    // SECURITY: Limit array lengths to prevent payload bomb / buffer overflow
    if (data.products && data.products.length > 100) {
      return NextResponse.json({ error: 'Payload too large: maximum 100 products per request' }, { status: 413 });
    }

    if (data.messages && data.messages.length > 200) {
      return NextResponse.json({ error: 'Payload too large: maximum 200 messages per request' }, { status: 413 });
    }

    // SECURITY: Do NOT accept user data (passwords) from client-side POST
    if (data.products) serverDb.products = mergeProducts(serverDb.products, data.products);
    if (data.messages) serverDb.messages = mergeMessages(serverDb.messages, data.messages);
    if (data.reviews) serverDb.reviews = mergeReviews(serverDb.reviews, data.reviews);

    // Try upserting to Supabase DB
    try {
      if (supabase) {
        if (data.products?.length) await supabase.from('products').upsert(data.products, { onConflict: 'id' });
        if (data.messages?.length) await supabase.from('messages').upsert(data.messages, { onConflict: 'id' });
        if (data.reviews?.length) await supabase.from('reviews').upsert(data.reviews, { onConflict: 'id' });
      }
    } catch (e) {
      // Ignore Supabase sync errors if table doesn't exist
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update server DB' }, { status: 400 });
  }
}
