'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card, Avatar, Statistic, Row, Col, Button, Tag, Typography, Popconfirm,
  Empty, Space, Modal, Form, Input, Select, Alert, message, Tabs, Rate, Badge, Divider
} from 'antd';
import {
  UserOutlined, PlusOutlined, LogoutOutlined, CheckCircleOutlined, DeleteOutlined,
  EditOutlined, HeartFilled, LockOutlined, MailOutlined, SettingOutlined,
  ClockCircleOutlined, StarOutlined, MessageOutlined, ShoppingCartOutlined,
  CheckOutlined, SyncOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  getUser, getProducts, removeUser, deleteProduct, getDirectMessages,
  getWishlist, updateUserProfile, updateMessageStatus, markProductAsSold, addReview
} from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';
import MAJORS from '../../lib/majors';

const { Title, Text, Paragraph } = Typography;

function formatPrice(price: number) {
  const num = Number(price);
  if (isNaN(num) || num < 0) return 'Rp0';
  return 'Rp' + Math.floor(num).toLocaleString('id-ID');
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Edit Profile Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Rating & Review Modal
  const [reviewModalMsg, setReviewModalMsg] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const loadAllData = () => {
    const u = getUser();
    setUser(u);
    if (!u) return;

    // Load seller's own products
    const stored = getProducts();
    const mergedMap = new Map();
    SEED_PRODUCTS.forEach(p => mergedMap.set(p.id, p));
    stored.forEach(p => mergedMap.set(p.id, p));
    const allProds = Array.from(mergedMap.values());

    const mine = allProds.filter(p => p.sellerEmail === u.email);
    setMyProducts(mine);

    // Load Wishlist
    const wishIds = getWishlist();
    const wishList = allProds.filter(p => wishIds.includes(p.id));
    setWishlistProducts(wishList);

    // Load Messages / Orders
    const allMsgs = getDirectMessages();
    
    // Purchases: user is buyer
    const userPurchases = allMsgs.filter((m: any) => m.buyerEmail === u.email && !m.deleted && !m.deletedByBuyer);
    userPurchases.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPurchases(userPurchases);

    // Sales: user is seller
    const userSales = allMsgs.filter((m: any) => m.sellerEmail === u.email && !m.deleted && !m.deletedBySeller);
    userSales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSales(userSales);
  };

  useEffect(() => {
    loadAllData();

    if (typeof window !== 'undefined') {
      window.addEventListener('messages-updated', loadAllData);
      window.addEventListener('products-updated', loadAllData);
      window.addEventListener('storage', loadAllData);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('messages-updated', loadAllData);
        window.removeEventListener('products-updated', loadAllData);
        window.removeEventListener('storage', loadAllData);
      }
    };
  }, []);

  function handleLogout() {
    removeUser();
    window.location.href = '/';
  }

  function handleDeleteProduct(id: string) {
    deleteProduct(id);
    setMyProducts(prev => prev.filter(p => p.id !== id));
    messageApi.success('Produk berhasil dihapus.');
  }

  function handleOpenEditModal() {
    if (!user) return;
    setEditError('');
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      major: user.major,
      batch: user.batch,
      newPassword: '',
      confirmPassword: '',
    });
    setEditModalOpen(true);
  }

  async function handleSaveProfile(values: any) {
    if (!user) return;
    setEditError('');

    if (values.newPassword && values.newPassword.length < 6) {
      setEditError('Password baru minimal 6 karakter!');
      return;
    }

    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      setEditError('Konfirmasi password baru tidak cocok!');
      return;
    }

    setEditLoading(true);

    const res = await updateUserProfile(user.email, {
      name: values.name,
      email: values.email,
      major: values.major,
      batch: values.batch,
      password: values.newPassword,
    });

    setEditLoading(false);

    if (!res.ok) {
      setEditError(res.error || 'Gagal memperbarui profil.');
      return;
    }

    setUser(res.user);
    setEditModalOpen(false);
    messageApi.success('Profil & Password berhasil diperbarui!');
  }

  // Handle Mark Order Completed
  function handleCompleteOrder(msg: any) {
    updateMessageStatus(msg.id, 'completed');
    markProductAsSold(msg.productId);
    messageApi.success('Transaksi berhasil diselesaikan!');
    loadAllData();

    // If current user is buyer, prompt for rating
    if (user && msg.buyerEmail === user.email && !msg.reviewed) {
      openRatingModal(msg);
    }
  }

  // Open Rating Modal
  function openRatingModal(msg: any) {
    setReviewModalMsg(msg);
    setRatingValue(5);
    setCommentText('');
  }

  // Submit Rating
  function handleSubmitReview() {
    if (!reviewModalMsg) return;

    addReview({
      productId: reviewModalMsg.productId,
      productName: reviewModalMsg.productName,
      sellerEmail: reviewModalMsg.sellerEmail,
      buyerEmail: user.email,
      buyerName: user.name,
      rating: ratingValue,
      comment: commentText.trim() || 'Sangat memuaskan! Recomended seller.',
      messageId: reviewModalMsg.id,
    });

    messageApi.success('Terima kasih! Ulasan & rating berhasil dikirim.');
    setReviewModalMsg(null);
    loadAllData();
  }

  function handleOpenChat() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-direct-chat'));
    }
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

  // Helper to render Order Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'sold':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Selesai Transaksi</Tag>;
      case 'rejected':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Dibatalkan</Tag>;
      case 'accepted':
        return <Tag color="processing" icon={<SyncOutlined spin />}>Siap COD Kampus</Tag>;
      default:
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Sedang Diproses</Tag>;
    }
  };

  // Render List of Order Cards
  const renderOrderList = (orderList: any[], isBuyer: boolean) => {
    if (orderList.length === 0) {
      return <Empty description="Belum ada riwayat pesanan." />;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orderList.map((item: any) => {
          const isCompleted = item.status === 'completed' || item.status === 'sold';

          return (
            <Card
              key={item.id}
              size="small"
              style={{
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ID: #{item.id.substring(0, 8)} • {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </div>
                {renderStatusBadge(item.status)}
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                  <img
                    src={`/api/product-image?id=${item.productId}`}
                    alt={item.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 2 }} ellipsis>
                    {item.productName}
                  </Text>
                  <Text type="danger" strong style={{ fontSize: 14 }}>
                    {formatPrice(item.productPrice)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                    {isBuyer ? `Penjual: ${item.sellerName}` : `Pembeli: ${item.buyerName}`}
                  </Text>
                  {item.codLocation && (
                    <Tag color="geekblue" style={{ marginTop: 6, fontSize: 11 }}>
                      📍 COD: {item.codLocation}
                    </Tag>
                  )}
                </div>
              </div>

              <Divider style={{ margin: '12px 0 10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Button icon={<MessageOutlined />} size="small" onClick={handleOpenChat}>
                  Buka Chat
                </Button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!isCompleted && item.status !== 'rejected' && (
                    <Popconfirm
                      title="Konfirmasi Selesai"
                      description="Apakah transaksi dan serah terima barang ini sudah selesai?"
                      onConfirm={() => handleCompleteOrder(item)}
                      okText="Ya, Selesai"
                      cancelText="Batal"
                    >
                      <Button type="primary" size="small" icon={<CheckOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                        Selesaikan Transaksi
                      </Button>
                    </Popconfirm>
                  )}

                  {isBuyer && isCompleted && !item.reviewed && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<StarOutlined />}
                      onClick={() => openRatingModal(item)}
                      style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                    >
                      Beri Rating & Ulasan
                    </Button>
                  )}

                  {isBuyer && isCompleted && item.reviewed && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Sudah Diulas</Tag>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      <Navbar />
      <main style={{ maxWidth: 1240, margin: '24px auto', padding: '0 16px 48px 16px', minHeight: '60vh' }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 20 }}>
          Profil & <span style={{ color: '#003399' }}>Riwayat Transaksi</span>
        </Title>

        <Row gutter={[20, 20]}>
          {/* Left Column: User Info & Actions */}
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 16, textAlign: 'center', padding: 8, boxShadow: '0 4px 16px rgba(0,26,64,0.06)' }}>
              <Avatar
                size={76}
                style={{ backgroundColor: '#003399', fontSize: 32, marginBottom: 12, border: '3px solid #00e5ff' }}
                icon={<UserOutlined />}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Title level={3} style={{ margin: '0 0 4px 0', fontSize: 20 }}>{user.name}</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>{user.email}</Text>
              <Space wrap style={{ marginBottom: 16, justifyContent: 'center' }}>
                <Tag color="blue">{user.major}</Tag>
                <Tag color="cyan">Angkatan {user.batch}</Tag>
                <Tag color="green" icon={<CheckCircleOutlined />}>Terverifikasi</Tag>
              </Space>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button icon={<SettingOutlined />} block onClick={handleOpenEditModal} style={{ borderRadius: 20, borderColor: '#003399', color: '#003399', fontWeight: 600 }}>
                  Ubah Email & Password
                </Button>
                <Link href="/sell">
                  <Button type="primary" icon={<PlusOutlined />} block size="large" style={{ background: 'linear-gradient(135deg, #003399 0%, #001a40 100%)', border: 'none', borderRadius: 20 }}>
                    Jual Barang Baru
                  </Button>
                </Link>
                <Button danger icon={<LogoutOutlined />} block onClick={handleLogout} style={{ borderRadius: 20 }}>
                  Keluar Akun
                </Button>
              </div>
            </Card>
          </Col>

          {/* Right Column: Main Content Tabs */}
          <Col xs={24} md={16}>
            <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Pembelian Saya</span>}
                    value={purchases.length}
                    styles={{ content: { color: '#003399', fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Penjualan Saya</span>}
                    value={sales.length}
                    styles={{ content: { fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Barang Jualan</span>}
                    value={myProducts.length}
                    styles={{ content: { color: '#10b981', fontSize: 18, fontWeight: 800 } }}
                  />
                </Card>
              </Col>
            </Row>

            <Card style={{ borderRadius: 16 }}>
              <Tabs
                defaultActiveKey="purchases"
                items={[
                  {
                    key: 'purchases',
                    label: (
                      <span>
                        <ShoppingCartOutlined /> Riwayat Pembelian ({purchases.length})
                      </span>
                    ),
                    children: renderOrderList(purchases, true),
                  },
                  {
                    key: 'sales',
                    label: (
                      <span>
                        <ClockCircleOutlined /> Riwayat Penjualan ({sales.length})
                      </span>
                    ),
                    children: renderOrderList(sales, false),
                  },
                  {
                    key: 'my-products',
                    label: (
                      <span>
                        <PlusOutlined /> Barang Jualan ({myProducts.length})
                      </span>
                    ),
                    children: (
                      <div>
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
                                    {item.stock <= 0 || item.status === 'sold' ? (
                                      <Tag color="red">Terjual / Habis</Tag>
                                    ) : (
                                      <Tag color="green">Stok: {item.stock ?? 1}</Tag>
                                    )}
                                  </div>
                                </div>

                                <Space size={4} style={{ flexShrink: 0 }}>
                                  <Link href="/sell">
                                    <Button size="small" icon={<EditOutlined />}>
                                      <span>Edit</span>
                                    </Button>
                                  </Link>
                                  <Popconfirm title="Hapus produk ini?" onConfirm={() => handleDeleteProduct(item.id)} okText="Ya" cancelText="Batal">
                                    <Button danger size="small" type="text" icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Space>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'wishlist',
                    label: (
                      <span>
                        <HeartFilled style={{ color: '#ef4444' }} /> Favorit ({wishlistProducts.length})
                      </span>
                    ),
                    children: (
                      <div>
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
                                  justifyContent: 'space-between',
                                  gap: 12,
                                  padding: 12,
                                  borderRadius: 12,
                                  border: '1px solid #e2e8f0',
                                  background: '#ffffff',
                                  flexWrap: 'wrap',
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
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Modal Rating & Ulasan */}
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
                <Rate value={ratingValue} onChange={setRatingValue} style={{ fontSize: 24 }} />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Pesan Ulasan:</Text>
                <Input.TextArea
                  rows={4}
                  placeholder="Ceritakan pengalaman berbelanja kamu (kondisi barang, ketepatan waktu COD, respon penjual)..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Ubah Email & Password */}
        <Modal
          title={
            <Space>
              <SettingOutlined style={{ color: '#003399' }} />
              <span>Pengaturan Profil & Ubah Password</span>
            </Space>
          }
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          {editError && <Alert message={editError} type="error" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />}

          <Form form={form} layout="vertical" onFinish={handleSaveProfile} size="middle">
            <Form.Item
              label="Nama Lengkap"
              name="name"
              rules={[{ required: true, message: 'Nama wajib diisi!' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
            </Form.Item>

            <Form.Item
              label="Email Kampus (@student.president.ac.id)"
              name="email"
              rules={[
                { required: true, message: 'Email kampus wajib diisi!' },
                { type: 'email', message: 'Format email tidak valid!' }
              ]}
              extra="Perubahan email akan digunakan untuk login berikutnya."
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={14}>
                <Form.Item label="Major / Program Studi" name="major" rules={[{ required: true }]}>
                  <Select options={MAJORS.map(m => ({ label: m, value: m }))} />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="Angkatan" name="batch" rules={[{ required: true }]}>
                  <Select
                    options={['2021', '2022', '2023', '2024', '2025', '2026'].map(b => ({ label: `Angkatan ${b}`, value: b }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Card size="small" style={{ background: '#f8fafc', marginBottom: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10, color: '#003399' }}>
                🔒 Ubah Password (Kosongkan jika tidak ingin diubah):
              </Text>
              
              <Form.Item label="Password Baru" name="newPassword" style={{ marginBottom: 12 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password baru minimal 6 karakter" />
              </Form.Item>

              <Form.Item label="Konfirmasi Password Baru" name="confirmPassword" style={{ marginBottom: 0 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Ulangi password baru" />
              </Form.Item>
            </Card>

            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: 8 }}>
              <Button onClick={() => setEditModalOpen(false)}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={editLoading} style={{ background: '#003399', border: 'none' }}>
                Simpan Perubahan
              </Button>
            </div>
          </Form>
        </Modal>
      </main>
      <Footer />
    </>
  );
}
