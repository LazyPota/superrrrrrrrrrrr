'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Avatar, Statistic, Row, Col, Button, Tag, Typography, Popconfirm, Empty, Space, Modal, Form, Input, Select, Alert, message } from 'antd';
import { UserOutlined, PlusOutlined, LogoutOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined, HeartFilled, LockOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getUser, getProducts, removeUser, deleteProduct, getDirectMessages, getWishlist, updateUserProfile } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';
import MAJORS from '../../lib/majors';

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
  
  // Edit Profile & Password Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

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
      {contextHolder}
      <Navbar />
      <main style={{ maxWidth: 1240, margin: '24px auto', padding: '0 16px 48px 16px', minHeight: '60vh' }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 20 }}>
          Profil <span style={{ color: '#003399' }}>Saya</span>
        </Title>

        <Row gutter={[20, 20]}>
          {/* User Info Card */}
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

          {/* Stats & Products List */}
          <Col xs={24} md={16}>
            <Row gutter={[10, 10]} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card styles={{ body: { padding: '12px 4px', textAlign: 'center' } }} style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#64748b' }}>Produk Dijual</span>}
                    value={myProducts.length}
                    styles={{ content: { color: '#003399', fontSize: 18, fontWeight: 800 } }}
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
            </Card>
          </Col>
        </Row>

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
