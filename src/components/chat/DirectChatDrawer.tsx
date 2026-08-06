'use client';

import { useState, useEffect, useRef } from 'react';
import { Drawer, List, Tag, Button, Typography, Space, Badge, Card, Empty, Popconfirm, Avatar, Input } from 'antd';
import { MessageOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, ShoppingCartOutlined, UserOutlined, SoundOutlined, SendOutlined } from '@ant-design/icons';
import { getUser, getDirectMessages, updateMessageStatus, markMessagesAsRead, playOrderSound, speakVoice, addReplyToMessage, syncWithServer } from '../../lib/store';

const { Title, Text, Paragraph } = Typography;

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function DirectChatDrawer({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyTextMap, setReplyTextMap] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    let interval;
    if (open) {
      const u = getUser();
      setUser(u);
      if (u) {
        refreshMessages(u);
        markMessagesAsRead(u.email);
      }
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }

      // Live sync interval while open
      interval = setInterval(() => {
        const currentUser = getUser();
        if (currentUser) {
          syncWithServer().then(() => refreshMessages(currentUser));
        }
      }, 2000);
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

  // BUG FIX #9: Auto-scroll to bottom when messages/replies change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  function refreshMessages(currentUser) {
    const u = currentUser || getUser();
    if (u) {
      const msgs = getDirectMessages();
      const userMsgs = msgs.filter(m => m.sellerEmail === u.email || m.buyerEmail === u.email);
      userMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(userMsgs);
    }
  }

  function handleStatusChange(id, newStatus) {
    updateMessageStatus(id, newStatus);
    refreshMessages();
  }

  function handleSendReply(msgId) {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) return;
    addReplyToMessage(msgId, user.email, user.name, text.trim());
    setReplyTextMap(prev => ({ ...prev, [msgId]: '' }));
    refreshMessages();
  }

  const [drawerWidth, setDrawerWidth] = useState(380);

  useEffect(() => {
    function handleResize() {
      setDrawerWidth(typeof window !== 'undefined' && window.innerWidth < 480 ? '100%' : 380);
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
        <List
          dataSource={messages}
          renderItem={item => {
            const isSeller = item.sellerEmail === user.email;

            return (
              <Card
                key={item.id}
                size="small"
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  borderColor: item.status === 'accepted' ? '#36b37e' : item.status === 'rejected' ? '#ff4d4f' : '#0052cc',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Tag color={item.type === 'nego' ? 'gold' : 'blue'}>
                    {item.type === 'nego' ? '🤝 Penawaran Nego' : '🛒 Pesanan COD'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>

                <Title level={5} style={{ margin: '0 0 4px 0' }}>{item.productName}</Title>

                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                  <div>{isSeller ? `Dari Pembeli: ${item.buyerName}` : `Penjual: ${item.sellerName}`}</div>
                  <div>Harga Tertera: {formatPrice(item.productPrice)}</div>
                  {item.proposedPrice && (
                    <div style={{ fontWeight: 700, color: '#0052cc', fontSize: 14, marginTop: 2 }}>
                      Harga Tawaran: {formatPrice(item.proposedPrice)}
                    </div>
                  )}
                  <Tag color="green" style={{ marginTop: 4, fontSize: 10 }}>Metode: COD Tunai</Tag>
                </div>

                {item.messageText && (
                  <Paragraph style={{ background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 12, margin: '8px 0', border: '1px solid #e2e8f0' }}>
                    &quot;{item.messageText}&quot;
                  </Paragraph>
                )}

                {/* Status & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                  <div>
                    {item.status === 'pending' && <Tag color="warning">Menunggu Konfirmasi</Tag>}
                    {item.status === 'accepted' && <Tag color="success" icon={<CheckCircleOutlined />}>Disetujui (Siap COD)</Tag>}
                    {item.status === 'rejected' && <Tag color="error" icon={<CloseCircleOutlined />}>Ditolak</Tag>}
                  </div>

                  {isSeller && item.status === 'pending' && (
                    <Space size="small">
                      <Popconfirm title="Terima tawaran/orderan ini?" onConfirm={() => handleStatusChange(item.id, 'accepted')} okText="Ya" cancelText="Batal">
                        <Button type="primary" size="small" style={{ background: '#36b37e', borderColor: '#36b37e' }}>
                          Terima
                        </Button>
                      </Popconfirm>
                      <Popconfirm title="Tolak tawaran ini?" onConfirm={() => handleStatusChange(item.id, 'rejected')} okText="Ya" cancelText="Batal">
                        <Button danger size="small" type="text">
                          Tolak
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                </div>

                {/* Live Chat History */}
                {item.replies && item.replies.length > 0 && (
                  <div style={{ marginTop: 12, background: '#f1f5f9', padding: 8, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    <Text strong style={{ fontSize: 11, color: '#64748b' }}>Percakapan Obrolan:</Text>
                    {item.replies.map(r => {
                      const isMe = r.senderEmail === user.email;
                      return (
                        <div
                          key={r.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: isMe ? '#0052cc' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            padding: '6px 10px',
                            borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            fontSize: 12,
                            border: isMe ? 'none' : '1px solid #cbd5e1',
                          }}
                        >
                          <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2 }}>{r.senderName}</div>
                          <div>{r.text}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chat Input Box - always visible */}
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <Input
                    placeholder="Ketik balasan pesan..."
                    size="small"
                    value={replyTextMap[item.id] || ''}
                    onChange={e => setReplyTextMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                    onPressEnter={() => handleSendReply(item.id)}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    onClick={() => handleSendReply(item.id)}
                  />
                </div>
              </Card>
            );
          }}
        />
      )}
      <div ref={chatEndRef} />
    </Drawer>
  );
}
