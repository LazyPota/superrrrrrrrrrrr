'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FloatButton, Drawer, Input, Button, Tag, Avatar, Spin, Space, Typography, Card, message } from 'antd';
import { RobotOutlined, SendOutlined, ShoppingCartOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import { sendChatMessage } from '../../lib/chat';
import { getProducts, addToCart, getUser } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';

const { Text } = Typography;

const SUGGESTIONS = ['Rekomendasi produk', 'Cari kalkulator', 'Buku kalkulus', 'Makanan enak', 'Laptop bekas'];
const WELCOME = 'Halo! Aku asisten AI PresUMart. Mau cari atau tanya produk apa hari ini? Ketik pertanyaanmu atau pilih saran di bawah.';

function findProductsInReply(replyText: string, userText: string) {
  const stored = getProducts();
  const allProducts = Array.from(
    new Map([...stored, ...SEED_PRODUCTS].map(p => [p.id, p])).values()
  );

  const combinedText = (replyText + ' ' + userText).toLowerCase();
  const stopWords = ['bekas', 'untuk', 'edisi', 'saya', 'mau', 'beli', 'cari', 'ada', 'yang', 'dan', 'bisa', 'nih', 'deh'];

  return allProducts.filter(p => {
    const nameLower = p.name.toLowerCase();
    const catLower = (p.category || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();

    // Direct string inclusion
    if (combinedText.includes(nameLower) || nameLower.includes(userText.toLowerCase().trim())) return true;

    // Filter keywords with length >= 3
    const keyWords = nameLower.split(/\s+/).filter(w => w.length >= 3 && !stopWords.includes(w));
    if (keyWords.length > 0) {
      const matchCount = keyWords.filter(kw => combinedText.includes(kw)).length;
      return matchCount >= 1;
    }

    return false;
  });
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  products?: any[];
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [drawerWidth, setDrawerWidth] = useState<number | string>(380);

  useEffect(() => {
    function handleResize() {
      setDrawerWidth(typeof window !== 'undefined' && window.innerWidth < 480 ? '100%' : 380);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [open]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleAddToCart(product) {
    const user = getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.email === product.sellerEmail) {
      messageApi.warning('Tidak bisa membeli produk sendiri.');
      return;
    }
    addToCart(product);
    messageApi.success(`${product.name} berhasil ditambahkan ke keranjang!`);
  }

  async function handleSend(text) {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .slice(1)
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));
      history.push({ role: 'user', content: content });

      const stored = getProducts();
      const allProducts = Array.from(
        new Map([...stored, ...SEED_PRODUCTS].map(p => [p.id, p])).values()
      );

      const rawReply = await sendChatMessage(history, allProducts);
      const reply = rawReply.replace(/\*/g, '');
      const matched = findProductsInReply(reply, content);

      const botMsg: ChatMessage = { role: 'bot', text: reply, products: matched };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'bot',
        text: 'Waduh, barang atau produk yang kamu cari belum tersedia saat ini di PresUMart 😅. Kamu bisa cek lagi nanti atau jadi yang pertama menjual barang ini di menu Jual Barang!',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {contextHolder}
      <FloatButton
        icon={<RobotOutlined style={{ color: '#0052cc', fontSize: 22 }} />}
        type="primary"
        tooltip="Tanya Asisten AI PresUMart"
        style={{ right: 24, bottom: 24, width: 56, height: 56, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        onClick={() => setOpen(true)}
      />

      <Drawer
        title={
          <Space>
            <Avatar style={{ background: '#0052cc' }} icon={<RobotOutlined />} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>PresU Assistant AI</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Asisten Belanja Pintar Mahasiswa</Text>
            </div>
          </Space>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={drawerWidth}
        styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }} ref={messagesRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'bot' ? 'flex-start' : 'flex-end',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  maxWidth: '88%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  background: msg.role === 'bot' ? '#f1f5f9' : '#0052cc',
                  color: msg.role === 'bot' ? '#0f172a' : '#fff',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>

              {/* Matched Product Cards */}
              {msg.products && msg.products.length > 0 && (
                <div style={{ width: '88%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {msg.products.map(product => (
                    <Card
                      key={product.id}
                      size="small"
                      style={{
                        borderRadius: 12,
                        border: '1px solid #0052cc',
                        background: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0, 82, 204, 0.12)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <PictureOutlined style={{ fontSize: 22, color: '#0052cc' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                          </div>
                          <div style={{ color: '#0052cc', fontWeight: 800, fontSize: 13 }}>
                            Rp{Number(product.price).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <Link href={`/product?id=${product.id}`} onClick={() => setOpen(false)} style={{ flex: 1 }}>
                          <Button type="default" size="small" icon={<EyeOutlined />} block style={{ fontSize: 12 }}>
                            Detail
                          </Button>
                        </Link>
                        <Button
                          type="primary"
                          size="small"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(product)}
                          style={{ flex: 1, fontSize: 12 }}
                        >
                          Tambah
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, marginBottom: 12 }}>
              <Spin size="small" />
              <span>PresU AI sedang mengetik...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {SUGGESTIONS.map(s => (
            <Tag
              key={s}
              color="blue"
              style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}
              onClick={() => handleSend(s)}
            >
              {s}
            </Tag>
          ))}
        </div>

        {/* Input */}
        <Input.Search
          placeholder="Ketik pertanyaan belanja..."
          enterButton={
            <Button type="primary" icon={<SendOutlined />} loading={loading} />
          }
          size="large"
          value={input}
          onChange={e => setInput(e.target.value)}
          onSearch={text => handleSend(text)}
        />
      </Drawer>
    </>
  );
}
