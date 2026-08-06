'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Avatar, Statistic, Row, Col, Button, Tag, Typography, Popconfirm, Empty, Space } from 'antd';
import { UserOutlined, PlusOutlined, LogoutOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined, HeartFilled } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getUser, getProducts, removeUser, deleteProduct, getDirectMessages, getWishlist } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';

const { Title, Text } = Typography;

function formatPrice(price: number) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (!u) return;

    const stored = getProducts();
    const merged = new Map();
    SEED_PRODUCTS.forEach(p => merged.set(p.id, p));
    stored.forEach(p => merged.set(p.id, p));
    const all = Array.from(merged.values());
    const mine = all.filter(p => p.sellerEmail === u.email);
    setMyProducts(mine);

    const wishIds = getWishlist();
    const wishList = all.filter(p => wishIds.includes(p.id));
    setWishlistProducts(wishList);

    const msgs = getDirectMessages();
    setOrderCount(msgs.filter(m => m.sellerEmail === u.email).length);
    setPurchaseCount(msgs.filter(m => m.buyerEmail === u.email).length);
  }, []);

  function handleLogout() {
    removeUser();
    window.location.href = '/';
  }

  function handleDelete(id) {
    deleteProduct(id);
    setMyProducts(prev => prev.filter(p => p.id !== id));
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 1240, margin: '48px auto', padding: '0 16px', minHeight: '60vh' }}>
          <Card style={{ textAlign: 'center', padding: '48px 16px', borderRadius: 16 }}>
            <Empty description={<Title level={4}>Anda Belum Login</Title>}>
              <Link href="/login">
                <Button type="primary" size="large">Masuk Akun Kampus</Button>
              </Link>
            </Empty>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1240, margin: '24px auto', padding: '0 16px 48px 16px', minHeight: '60vh' }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 20 }}>
          Profil <span style={{ color: '#0052cc' }}>Saya</span>
        </Title>

        <Row gutter={[20, 20]}>
          {/* User Info Card */}
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 16, textAlign: 'center', padding: 8 }}>
              <Avatar
                size={72}
                style={{ backgroundColor: '#0052cc', fontSize: 32, marginBottom: 12 }}
                icon={<UserOutlined />}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Title level={3} style={{ margin: '0 0 4px 0', fontSize: 20 }}>{user.name}</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>{user.email}</Text>
              <Space wrap style={{ marginBottom: 16, justifyContent: 'center' }}>
                <Tag color="blue">{user.major}</Tag>
                <Tag color="cyan">Angkatan {user.batch}</Tag>
                <Tag color="green" icon={<CheckCircleOutlined />}>Terverifikasi</Tag>
              </Space>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/sell">
                  <Button type="primary" icon={<PlusOutlined />} block size="large">Jual Barang Baru</Button>
                </Link>
                <Button danger icon={<LogoutOutlined />} block onClick={handleLogout}>Keluar Akun</Button>
              </div>
            </Card>
          </Col>

          {/* Stats & Products List */}
          <Col xs={24} md={16}>
            <Row gutter={[10, 10]} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Produk Dijual</span>}
                    value={myProducts.length}
                    styles={{ content: { color: '#0052cc', fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Pesanan Masuk</span>}
                    value={orderCount}
                    styles={{ content: { fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Pembelian Saya</span>}
                    value={purchaseCount}
                    styles={{ content: { fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Daftar Produk yang Kamu Jual" style={{ borderRadius: 16 }}>
              {myProducts.length === 0 ? (
                <Empty description="Belum ada produk. Mulai jualan sekarang!">
                  <Link href="/sell">
                    <Button type="primary" icon={<PlusOutlined />}>Tambah Produk</Button>
                  </Link>
                </Empty>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myProducts.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>No Foto</div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 14, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{item.category}</Tag>
                          <Text type="danger" strong style={{ fontSize: 13 }}>{formatPrice(item.price)}</Text>
                        </div>
                      </div>

                      <Space size={4} style={{ flexShrink: 0 }}>
                        <Link href="/sell">
                          <Button size="small" icon={<EditOutlined />}>
                            <span className="hide-mobile">Kelola</span>
                          </Button>
                        </Link>
                        <Popconfirm title="Hapus produk ini?" onConfirm={() => handleDelete(item.id)} okText="Ya" cancelText="Batal">
                          <Button danger size="small" type="text" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title={
                <span>
                  <HeartFilled style={{ color: '#ef4444', marginRight: 8 }} />
                  Produk Favorit / Wishlist Saya ({wishlistProducts.length})
                </span>
              }
              style={{ borderRadius: 16, marginTop: 24 }}
            >
              {wishlistProducts.length === 0 ? (
                <Empty description="Belum ada produk favorit disukai. Klik ikon Hati pada produk untuk menyimpan!" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {wishlistProducts.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                          {(item.images?.[0] || item.image) ? (
                            <img src={item.images?.[0] || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 10 }}>Foto</div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <Text strong ellipsis style={{ fontSize: 14, display: 'block' }}>{item.name}</Text>
                          <Text type="danger" strong style={{ fontSize: 13 }}>{formatPrice(item.price)}</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Penjual: {item.seller}</Text>
                        </div>
                      </div>

                      <Link href={`/product?id=${item.id}`}>
                        <Button type="primary" size="small">Lihat Produk</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </main>
      <Footer />
    </>
  );
}
