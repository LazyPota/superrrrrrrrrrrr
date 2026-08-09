'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Drawer, List, Tag, Button, Typography, Space, Badge, Card, Empty, Popconfirm, Avatar, Input, Modal, Rate, message, Select } from 'antd';
import { MessageOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, ShoppingCartOutlined, UserOutlined, SoundOutlined, SendOutlined, StarOutlined, EnvironmentOutlined, ShopOutlined, TagOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUser, getDirectMessages, updateMessageStatus, markMessagesAsRead, playOrderSound, speakVoice, addReplyToMessage, syncWithServer, addReview, reduceProductStock, deleteDirectMessageThread, deleteMessageReply, markProductAsSold } from '../../lib/store';

const { Title, Text, Paragraph } = Typography;

function formatPrice(price: number) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

const CAMPUS_LOCATIONS = [
  '🏛️ Student Center President University',
  '🏢 Lobby Building A (Rektorat)',
  '🏢 Lobby Building B / C',
  '🍜 Kantin President University',
  '🏢 Dormitory Jababeka (Asrama)',
  '⛳ President Executive Club',
];

export default function DirectChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [reviewModalMsg, setReviewModalMsg] = useState<any>(null);
  const [codModalMsg, setCodModalMsg] = useState<any>(null);
  const [selectedCodLoc, setSelectedCodLoc] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();
  const chatEndRef = useRef<HTMLDivElement>(null);

  function handleDeleteThread(threadId: string) {
    deleteDirectMessageThread(threadId);
    messageApi.success('Riwayat obrolan pesan berhasil dihapus.');
    refreshMessages();
  }

  function handleDeleteReply(threadId: string, replyId: string) {
    deleteMessageReply(threadId, replyId);
    messageApi.success('Pesan berhasil dihapus.');
    refreshMessages();
  }

  function handleMarkAsSold(item: any) {
    updateMessageStatus(item.id, 'sold');
    addReplyToMessage(
      item.id,
      item.sellerEmail,
      item.sellerName,
      `🎉 Selesai! Penjual mengonfirmasi bahwa produk ${item.productName} telah TERJUAL kepada ${item.buyerName}. Terima kasih telah bertransaksi di PresUMart!`
    );
    markProductAsSold(item.productId);
    messageApi.success(`Barang berhasil dikonfirmasi TERJUAL kepada ${item.buyerName}!`);
    refreshMessages(user);
  }

  function handleSubmitReview() {
    if (!reviewModalMsg) return;
    if (!comment.trim()) {
      messageApi.error('Harap isi pesan ulasan kamu!');
      return;
    }
    addReview({
      messageId: reviewModalMsg.id,
      productId: reviewModalMsg.productId,
      productName: reviewModalMsg.productName,
      sellerEmail: reviewModalMsg.sellerEmail,
      buyerEmail: reviewModalMsg.buyerEmail,
      buyerName: reviewModalMsg.buyerName,
      rating,
      comment: comment.trim(),
    });
    updateMessageStatus(reviewModalMsg.id, 'completed');
    messageApi.success('Ulasan berhasil dikirim!');
    setReviewModalMsg(null);
    setComment('');
    setRating(5);
    refreshMessages();
  }

  function handleConfirmCodOrder() {
    if (!codModalMsg) return;
    updateMessageStatus(codModalMsg.id, 'pending', selectedCodLoc);
    addReplyToMessage(
      codModalMsg.id,
      user.email,
      user.name,
      `Saya menyetujui pesanan ini untuk COD di: ${selectedCodLoc}`
    );
    messageApi.success('Pesanan berhasil dibuat! Menunggu ketemuan COD di kampus.');
    setCodModalMsg(null);
    setShouldScrollBottom(true);
    refreshMessages();
  }

  function handleSendOffer(msg: any) {
    updateMessageStatus(msg.id, 'offered');
    addReplyToMessage(
      msg.id,
      user.email,
      user.name,
      'Penjual telah mengirimkan tawaran kartu produk. Silakan pembeli klik "Pesan & Tentukan Lokasi COD" jika sepakat.'
    );
    messageApi.success('Kartu tawaran produk berhasil dikirimkan!');
    setShouldScrollBottom(true);
    refreshMessages();
  }



  const [shouldScrollBottom, setShouldScrollBottom] = useState(false);

  useEffect(() => {
    let interval: any;
    if (open) {
      setShouldScrollBottom(true);
      const u = getUser();
      setUser(u);
      if (u) {
        refreshMessages(u);
        markMessagesAsRead(u.email);
      }
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }

      // Fast live sync interval while drawer is open (600ms for instant real-time chat)
      interval = setInterval(() => {
        const currentUser = getUser();
        if (currentUser) {
          syncWithServer().then(() => refreshMessages(currentUser));
        }
      }, 600);
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (interval) clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [open]);

  function refreshMessages(currentUser?: any) {
    const u = currentUser || getUser();
    if (u) {
      const msgs = getDirectMessages();
      const userMsgs = msgs.filter((m: any) => {
        if (m.deleted) return false;
        if (m.buyerEmail === u.email && m.deletedByBuyer) return false;
        if (m.sellerEmail === u.email && m.deletedBySeller) return false;
        return m.sellerEmail === u.email || m.buyerEmail === u.email;
      });
      userMsgs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(userMsgs)) {
          return prev;
        }
        return userMsgs;
      });
    }
  }

  function handleStatusChange(id: string, newStatus: any) {
    updateMessageStatus(id, newStatus);
    refreshMessages(user);
  }

  function handleSendReply(msgId: string) {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) return;
    addReplyToMessage(msgId, user.email, user.name, text.trim());
    setReplyTextMap(prev => ({ ...prev, [msgId]: '' }));
    refreshMessages(user);
  }

  const [drawerWidth, setDrawerWidth] = useState<number | string>(480);

  useEffect(() => {
    function handleResize() {
      setDrawerWidth(typeof window !== 'undefined' && window.innerWidth < 576 ? '100%' : 480);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return (
      <Drawer title="Pesan & Orderan" open={open} onClose={onClose} size={drawerWidth}>
        <Empty description="Silakan masuk akun terlebih dahulu untuk melihat pesan dan orderan.">
          <Button type="primary" onClick={() => window.location.href = '/login'}>Masuk</Button>
        </Empty>
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <Space>
          <MessageOutlined style={{ color: '#0052cc', fontSize: 20 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Kotak Pesan & Chat Website</div>
            <Text type="secondary" style={{ fontSize: 12 }}>COD Kampus President University</Text>
          </div>
        </Space>
      }
      open={open}
      onClose={onClose}
      size={drawerWidth}
      extra={
        <Button icon={<SoundOutlined />} size="small" type="text" onClick={() => { playOrderSound(); speakVoice('Ada pesan masuk!'); }} title="Tes Suara Notifikasi">
          Tes Suara
        </Button>
      }
    >
      {messages.length === 0 ? (
        <Empty description="Belum ada transaksi pesan atau orderan masuk." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(item => {
            const isSeller = item.sellerEmail === user.email;

            return (
              <Card
                key={item.id}
                size="small"
                style={{ borderRadius: 12, border: item.status === 'accepted' ? '2px solid #36b37e' : '1px solid #e2e8f0', background: '#ffffff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Space align="center">
                    <Avatar style={{ backgroundColor: isSeller ? '#0052cc' : '#36b37e' }} icon={<UserOutlined />}>
                      {isSeller ? 'P' : 'B'}
                    </Avatar>
                    <div>
                      <Text strong style={{ fontSize: 13, display: 'block' }}>
                        {isSeller ? `Pembeli: ${item.buyerName}` : `Penjual: ${item.sellerName}`}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.type === 'order' ? 'Pesanan COD' : 'Tawaran Nego'} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                  </Space>
                  <Space align="center" size={4}>
                    <Tag color={item.type === 'order' ? 'cyan' : (item.type === 'inquiry' ? 'blue' : 'gold')} style={{ borderRadius: 4, margin: 0 }}>
                      {item.type === 'order' ? 'Order' : (item.type === 'inquiry' ? 'Chat' : 'Nego')}
                    </Tag>
                    <Popconfirm title="Hapus seluruh riwayat pesan obrolan ini?" onConfirm={() => handleDeleteThread(item.id)} okText="Hapus" cancelText="Batal">
                      <Button danger size="small" type="text" icon={<DeleteOutlined style={{ fontSize: 13 }} />} title="Hapus Obrolan" />
                    </Popconfirm>
                  </Space>
                </div>

                <Link href={`/product?id=${item.productId}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, margin: '8px 0', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Text strong style={{ fontSize: 13, display: 'block', color: '#0052cc' }}>🛒 {item.productName} ↗</Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Total Transaksi COD:</Text>
                      <Text strong style={{ color: '#0052cc', fontSize: 14 }}>
                        {formatPrice(item.type === 'nego' && item.proposedPrice ? item.proposedPrice : item.productPrice)}
                      </Text>
                    </div>
                  </div>
                </Link>

                {/* Seller Confirmation Action Card: "Konfirmasi Barang Terjual ke Pembeli Ini" */}
                {isSeller && item.status !== 'completed' && item.status !== 'sold' && (
                  <div style={{ margin: '8px 0', background: '#eff6ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <Text strong style={{ fontSize: 12, color: '#1e40af', display: 'block' }}>
                        🏷️ Konfirmasi Penjualan Produk
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11, color: '#3b82f6' }}>
                        Konfirmasi barang ini telah TERJUAL ke Pembeli (<strong>{item.buyerName}</strong>)
                      </Text>
                    </div>
                    <Popconfirm
                      title={`Konfirmasi barang TERJUAL kepada ${item.buyerName}?`}
                      description="Stok produk akan otomatis ditandai habis/terjual."
                      onConfirm={() => handleMarkAsSold(item)}
                      okText="Ya, Barang Terjual"
                      cancelText="Batal"
                    >
                      <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                        Tandai Terjual ke {item.buyerName.split(' ')[0]}
                      </Button>
                    </Popconfirm>
                  </div>
                )}

                {/* Status Tag if already sold/completed */}
                {(item.status === 'completed' || item.status === 'sold') && (
                  <div style={{ margin: '8px 0', background: '#f0fdf4', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                    <Text strong style={{ color: '#15803d', fontSize: 12 }}>
                      ✅ BARANG TERJUAL KEPADA {item.buyerName.toUpperCase()} (Transaksi COD Selesai)
                    </Text>
                  </div>
                )}

                {/* Live Chat History */}
                {(() => {
                  const initialBubble = item.messageText ? [{
                    id: `init-${item.id}`,
                    senderEmail: item.buyerEmail,
                    senderName: item.buyerName,
                    text: item.messageText,
                    timestamp: item.createdAt || new Date(0).toISOString(),
                    seqIndex: -1,
                    isInitial: true,
                  }] : [];

                  const replyBubbles = (item.replies || []).map((r: any, idx: number) => ({
                    id: r.id,
                    senderEmail: r.senderEmail,
                    senderName: r.senderName,
                    text: r.text,
                    timestamp: r.timestamp || new Date().toISOString(),
                    seqIndex: idx,
                    isInitial: false,
                  }));

                  // GUARANTEE: Buyer's initial message is ALWAYS Bubble #0 (Top), followed sequentially by all replies!
                  const sortedReplies = [...replyBubbles].sort((a: any, b: any) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    if (Math.abs(timeA - timeB) > 60000) {
                      return timeA - timeB;
                    }
                    return (a.seqIndex || 0) - (b.seqIndex || 0);
                  });

                  const allBubbles = [...initialBubble, ...sortedReplies];

                  if (allBubbles.length === 0) return null;

                  return (
                    <div style={{ marginTop: 12, background: '#f8fafc', padding: 14, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 160, maxHeight: 380, overflowY: 'auto', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text strong style={{ fontSize: 12, color: '#003399' }}>💬 Percakapan Obrolan (Urutan Waktu):</Text>
                        <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>Real-time 0ms</Tag>
                      </div>
                      {allBubbles.map((b: any) => {
                        const isMe = b.senderEmail === user.email;
                        const timeStr = b.timestamp ? new Date(b.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
                        return (
                          <div
                            key={b.id}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '85%',
                              background: isMe ? 'linear-gradient(135deg, #003399 0%, #001a40 100%)' : '#ffffff',
                              color: isMe ? '#ffffff' : '#0f172a',
                              padding: '10px 14px',
                              borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              fontSize: 14,
                              lineHeight: 1.5,
                              boxShadow: '0 2px 8px rgba(0,26,64,0.06)',
                              border: isMe ? 'none' : '1px solid #cbd5e1',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 11, opacity: 0.85, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700 }}>{b.senderName} {b.isInitial ? '(Pesan Awal Pembeli)' : ''}</span>
                              <span style={{ fontSize: 10, opacity: 0.8 }}>{timeStr}</span>
                              {isMe && !b.isInitial && (
                                <Popconfirm title="Hapus pesan ini?" onConfirm={() => handleDeleteReply(item.id, b.id)} okText="Ya" cancelText="Batal">
                                  <DeleteOutlined style={{ cursor: 'pointer', fontSize: 12, color: '#fca5a5' }} title="Hapus Pesan" />
                                </Popconfirm>
                              )}
                            </div>
                            <div style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{b.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Chat Input Box - Spacious & Clear */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="Ketik balasan pesan..."
                    size="middle"
                    value={replyTextMap[item.id] || ''}
                    onChange={e => setReplyTextMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                    onPressEnter={() => handleSendReply(item.id)}
                    style={{ borderRadius: 20, fontSize: 14, padding: '6px 14px' }}
                  />
                  <Button
                    type="primary"
                    size="middle"
                    icon={<SendOutlined />}
                    onClick={() => handleSendReply(item.id)}
                    style={{ borderRadius: 20, padding: '0 18px', fontWeight: 600 }}
                  >
                    Kirim
                  </Button>
                </div>
              </Card>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Modal Beri Rating & Ulasan */}
      <Modal
        title="⭐ Beri Rating & Ulasan untuk Penjual"
        open={!!reviewModalMsg}
        onCancel={() => setReviewModalMsg(null)}
        onOk={handleSubmitReview}
        okText="Kirim Ulasan"
        cancelText="Batal"
      >
        {reviewModalMsg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Produk:</Text>
              <Text type="secondary">{reviewModalMsg.productName}</Text>
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Penjual:</Text>
              <Text type="secondary">{reviewModalMsg.sellerName}</Text>
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Rating (1 - 5 Bintang):</Text>
              <Rate value={rating} onChange={setRating} style={{ fontSize: 24 }} />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Pesan Ulasan:</Text>
              <Input.TextArea
                rows={4}
                placeholder="Ceritakan pengalaman berbelanja kamu (kondisi barang, ketepatan waktu COD, respon penjual)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi COD & Pilih Lokasi Kampus */}
      <Modal
        title="📍 Konfirmasi Pesanan & Pilih Lokasi COD Kampus"
        open={!!codModalMsg}
        onCancel={() => setCodModalMsg(null)}
        onOk={handleConfirmCodOrder}
        okText="Konfirmasi Pesanan COD"
        cancelText="Batal"
      >
        {codModalMsg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Barang yang Dipesan:</Text>
              <Text style={{ fontSize: 16, fontWeight: 700, color: '#0052cc' }}>{codModalMsg.productName}</Text>
              <div><Text type="secondary">{formatPrice(codModalMsg.productPrice)}</Text></div>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Pilih Titik Ketemuan COD (Jababeka Campus):</Text>
              <Select
                value={selectedCodLoc}
                onChange={setSelectedCodLoc}
                style={{ width: '100%' }}
                options={CAMPUS_LOCATIONS.map(loc => ({ label: loc, value: loc }))}
              />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 12, color: '#166534' }}>
                💡 <b>Petunjuk:</b> Setelah kamu klik konfirmasi, pesan otomatis akan terkirim ke penjual dengan lokasi ketemuan yang kamu pilih. Pembayaran dilakukan secara tunai/QRIS saat bertemu langsung (COD).
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </Drawer>
  );
}
