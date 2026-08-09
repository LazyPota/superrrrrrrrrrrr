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

      const mergedReplies = Array.from(replyMap.values()).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
  (existingList || []).forEach(p => map.set(p.id, p));
  (incomingList || []).forEach(p => map.set(p.id, p));
  return Array.from(map.values());
}

function mergeReviews(existingList: any[], incomingList: any[]) {
  const map = new Map();
  (existingList || []).forEach(r => map.set(r.id, r));
  (incomingList || []).forEach(r => map.set(r.id, r));
  return Array.from(map.values()).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function GET() {
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
        serverDb.products = mergeProducts(serverDb.products, supaProds);
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

  // SECURITY: Strip passwords from user data before sending to client
  return NextResponse.json({
    ...serverDb,
    users: stripPasswords(serverDb.users),
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // SECURITY: Do NOT accept user data (passwords) from client-side POST
    // Only accept products, messages, and reviews
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
