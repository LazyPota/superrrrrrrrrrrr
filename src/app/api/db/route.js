import { NextResponse } from 'next/server';

let serverDb = {
  users: [
    {
      name: 'Rina S.',
      email: 'rina.s@student.president.ac.id',
      password: 'h-1e0s3sk',
      major: 'Actuarial Science',
      batch: '2023',
    },
    {
      name: 'Ahmad R.',
      email: 'ahmad.r@student.president.ac.id',
      password: 'h-1e0s3sk',
      major: 'Information Technology',
      batch: '2026',
    },
  ],
  products: [],
  messages: [],
};

function mergeMessages(existingList, incomingList) {
  const map = new Map();
  (existingList || []).forEach(m => map.set(m.id, { ...m }));

  (incomingList || []).forEach(incoming => {
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, { ...incoming });
    } else {
      const replyMap = new Map();
      (existing.replies || []).forEach(r => replyMap.set(r.id, r));
      (incoming.replies || []).forEach(r => replyMap.set(r.id, r));

      const mergedReplies = Array.from(replyMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const updatedStatus = incoming.status !== 'pending' ? incoming.status : existing.status;

      map.set(incoming.id, {
        ...existing,
        ...incoming,
        status: updatedStatus,
        replies: mergedReplies,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function mergeUsers(existingList, incomingList) {
  const map = new Map();
  (existingList || []).forEach(u => map.set(u.email, u));
  (incomingList || []).forEach(u => map.set(u.email, u));
  return Array.from(map.values());
}

function mergeProducts(existingList, incomingList) {
  const map = new Map();
  (existingList || []).forEach(p => map.set(p.id, p));
  (incomingList || []).forEach(p => map.set(p.id, p));
  return Array.from(map.values());
}

export async function GET() {
  return NextResponse.json(serverDb);
}

export async function POST(req) {
  try {
    const data = await req.json();
    if (data.users) serverDb.users = mergeUsers(serverDb.users, data.users);
    if (data.products) serverDb.products = mergeProducts(serverDb.products, data.products);
    if (data.messages) serverDb.messages = mergeMessages(serverDb.messages, data.messages);
    return NextResponse.json({ ok: true, serverDb });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update server DB' }, { status: 400 });
  }
}
