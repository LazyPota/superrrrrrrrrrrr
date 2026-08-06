'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Row, Col, Typography, Tag, Button, Breadcrumb, Descriptions, Space, Image, message, Spin, Empty, Flex, Modal, InputNumber, Input, Rate, Avatar, List } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined, UserOutlined, PictureOutlined, DollarOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { getProducts, addToCart, getUser, sendDirectMessage, getProductReviews, getSellerRating } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';

const { Title, Text, Paragraph } = Typography;

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [negoModalOpen, setNegoModalOpen] = useState(false);
  const [negoPrice, setNegoPrice] = useState(0);
  const [negoNote, setNegoNote] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [reviews, setReviews] = useState<any[]>([]);
  const [sellerRating, setSellerRating] = useState<{ avgRating: number; totalReviews: number }>({ avgRating: 5.0, totalReviews: 0 });

  useEffect(() => {
    if (productId) {
      const all = getProducts();
      let found = all.find(p => p.id === productId);
      if (!found) {
        found = SEED_PRODUCTS.find(p => p.id === productId);
      }
      if (found) {
        setProduct(found);
        setNegoPrice(found.price);
        setReviews(getProductReviews(found.id));
        setSellerRating(getSellerRating(found.sellerEmail));
      } else {
        setNotFound(true);
      }
    }
  }, [productId]);

  const isOutOfStock = product?.stock !== undefined && product?.stock <= 0;

  function handleAddToCart() {
    const user = getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.email === product.sellerEmail) {
      messageApi.warning('Tidak bisa membeli produk sendiri.');
      return;
    }
    if (isOutOfStock) {
      messageApi.error('Maaf, stok produk ini telah habis.');
      return;
    }
    addToCart(product);
    messageApi.success('Produk berhasil ditambahkan ke keranjang!');
  }

  function handleSendNego() {
    const user = getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!negoPrice || negoPrice <= 0) {
      messageApi.error('Masukkan nominal tawaran harga yang valid!');
      return;
    }
    if (negoPrice >= product.price) {
      messageApi.warning('Harga nego harus lebih rendah dari harga asli produk.');
      return;
    }

    sendDirectMessage({
      sellerEmail: product.sellerEmail,
      sellerName: product.seller,
      buyerEmail: user.email,
      buyerName: user.name,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      proposedPrice: negoPrice,
      messageText: negoNote || `Saya mengajukan penawaran harga Rp${Number(negoPrice).toLocaleString('id-ID')}`,
      type: 'nego',
    });

    messageApi.success('Penawaran nego berhasil dikirimkan ke Chat Website Penjual!');
    setNegoModalOpen(false);
    
    // Automatically open the Direct Chat Drawer on the website
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-direct-chat'));
    }, 300);
  }

  if (notFound) {
    return (
      <main style={{ maxWidth: 1240, margin: '48px auto', padding: '0 24px', minHeight: '60vh' }}>
        <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16 }}>
          <Empty description={<Title level={4}>Produk Tidak Ditemukan</Title>}>
            <Link href="/">
              <Button type="primary" icon={<ArrowLeftOutlined />}>Kembali ke Beranda</Button>
            </Link>
          </Empty>
        </Card>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ maxWidth: 1240, margin: '48px auto', padding: '0 24px', textAlign: 'center', minHeight: '60vh' }}>
        <Spin size="large" description="Memuat detail produk..." />
      </main>
    );
  }

  return (
    <>
      {contextHolder}
      <main style={{ maxWidth: 1240, margin: '24px auto 48px auto', padding: '0 24px' }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { title: <Link href="/">Beranda</Link> },
            { title: <Link href={`/?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link> },
            { title: product.name },
          ]}
        />

        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          <Row gutter={[32, 32]}>
            {/* Image Side */}
            <Col xs={24} md={10}>
              <div style={{ borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.image ? (
                  <Image
                    alt={product.name}
                    src={product.image}
                    style={{ width: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <PictureOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                    <div>Foto tidak tersedia</div>
                  </div>
                )}
              </div>
            </Col>

            {/* Info Side */}
            <Col xs={24} md={14}>
              <Space size="small" style={{ marginBottom: 12 }} wrap>
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                  {product.category}
                </Tag>
                {isOutOfStock ? (
                  <Tag color="red" style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                    Stok Habis (0 Unit)
                  </Tag>
                ) : (
                  <Tag color="green" style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                    Stok Tersedia: {product.stock ?? 1} Unit
                  </Tag>
                )}
                {product.allowNego !== false ? (
                  <Tag color="gold" icon={<DollarOutlined />} style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                    Bisa Nego Harga
                  </Tag>
                ) : (
                  <Tag color="default" style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                    Harga Pas (Nego Nonaktif)
                  </Tag>
                )}
                <Tag color="cyan" icon={<DollarOutlined />} style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}>
                  Pembayaran: COD
                </Tag>
              </Space>

              <Title level={2} style={{ margin: '0 0 12px 0', fontWeight: 800 }}>
                {product.name}
              </Title>
              <Text type="danger" style={{ fontSize: 28, fontWeight: 800, display: 'block', marginBottom: 24 }}>
                {formatPrice(product.price)}
              </Text>

              <Card style={{ background: '#f8fafc', borderRadius: 12, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>Informasi Penjual</Title>
                <Flex vertical gap="small">
                  <Text strong style={{ fontSize: 16 }}>
                    <UserOutlined style={{ marginRight: 8, color: '#0052cc' }} />
                    {product.seller}
                  </Text>
                  <Text type="secondary">
                    {product.sellerMajor} • Angkatan {product.sellerBatch}
                  </Text>
                  <Space wrap>
                    <Tag color="green" icon={<CheckCircleOutlined />}>Terverifikasi Mahasiswa PresUniv</Tag>
                    <Tag color="gold" icon={<StarOutlined />}>⭐ {sellerRating.avgRating} / 5.0 ({sellerRating.totalReviews} Ulasan)</Tag>
                  </Space>
                </Flex>
              </Card>

              <Space size="middle" style={{ marginBottom: 32 }} wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  danger={isOutOfStock}
                  style={{ height: 48, padding: '0 28px', fontSize: 16 }}
                >
                  {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </Button>

                {product.allowNego !== false && (
                  <Button
                    type="default"
                    size="large"
                    disabled={isOutOfStock}
                    icon={<DollarOutlined style={{ color: isOutOfStock ? '#94a3b8' : '#d97706' }} />}
                    onClick={() => {
                      const u = getUser();
                      if (!u) {
                        window.location.href = '/login';
                        return;
                      }
                      if (u.email === product.sellerEmail) {
                        messageApi.warning('Tidak bisa menawar produk sendiri.');
                        return;
                      }
                      setNegoModalOpen(true);
                    }}
                    style={{ height: 48, padding: '0 24px', fontSize: 16, borderColor: isOutOfStock ? '#d1d5db' : '#f59e0b', color: isOutOfStock ? '#94a3b8' : '#b45309' }}
                  >
                    Nego Harga
                  </Button>
                )}

                <Button
                  size="large"
                  icon={<MessageOutlined style={{ color: '#0052cc' }} />}
                  onClick={() => {
                    const u = getUser();
                    if (!u) {
                      window.location.href = '/login';
                      return;
                    }
                    window.dispatchEvent(new CustomEvent('open-direct-chat'));
                  }}
                  style={{ height: 48, padding: '0 20px', fontSize: 16 }}
                >
                  Chat Penjual di Web
                </Button>

                <Link href="/cart">
                  <Button size="large" style={{ height: 48, padding: '0 20px', fontSize: 16 }}>
                    Lihat Keranjang
                  </Button>
                </Link>
              </Space>

              <div>
                <Title level={4}>Deskripsi Produk</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line' }}>
                  {product.description}
                </Paragraph>
              </div>

              {/* Reviews & Rating Section */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Ulasan & Rating Pembeli ({reviews.length})
                  </Title>
                  {reviews.length > 0 && (
                    <Space wrap>
                      <Rate disabled value={Math.round(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length)} />
                      <Text strong style={{ fontSize: 16 }}>
                        {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)} / 5.0
                      </Text>
                    </Space>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <Empty description="Belum ada ulasan untuk produk ini. Jadilah pembeli pertama yang memberikan ulasan!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reviews.map((item: any) => (
                      <div key={item.id} style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0052cc', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <Text strong>{item.buyerName}</Text>
                            <Rate disabled value={item.rating} style={{ fontSize: 13 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              • {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </Text>
                          </div>
                          <Text style={{ fontSize: 14, color: '#1e293b' }}>&quot;{item.comment}&quot;</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Nego Modal */}
        <Modal
          title={
            <Space>
              <DollarOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
              <span>Tawar Harga Produk (Sistem Chat Website)</span>
            </Space>
          }
          open={negoModalOpen}
          onCancel={() => setNegoModalOpen(false)}
          footer={[
            <Button key="back" onClick={() => setNegoModalOpen(false)}>
              Batal
            </Button>,
            <Button key="submit" type="primary" icon={<MessageOutlined />} onClick={handleSendNego} style={{ background: '#0052cc', borderColor: '#0052cc' }}>
              Kirim Nego ke Chat Website Penjual
            </Button>,
          ]}
        >
          {product && (
            <div style={{ margin: '16px 0' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Produk yang ditawar:</Text>
              <Text strong style={{ fontSize: 16 }}>{product.name}</Text>
              
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, margin: '16px 0', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text type="secondary">Harga Tertera:</Text>
                  <Text strong style={{ textDecoration: 'line-through' }}>{formatPrice(product.price)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Tawaran Nego Kamu:</Text>
                  <Text strong style={{ fontSize: 18, color: '#0052cc' }}>{formatPrice(negoPrice)}</Text>
                </div>
                <Tag color="green" style={{ marginTop: 8 }}>Pembayaran: Tunai COD Kampus</Tag>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Nominal Tawaran (Rp):</label>
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={100}
                  max={product.price - 1}
                  value={negoPrice}
                  onChange={val => setNegoPrice(val || 0)}
                  formatter={val => `Rp ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={val => val.replace(/Rp\s?|(\.*)/g, '')}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Pesan Tambahan ke Penjual (Opsional):</label>
                <Input.TextArea
                  rows={3}
                  placeholder="Contoh: Halo ka, bisa COD di depan student center PU? Nego dikit ya..."
                  value={negoNote}
                  onChange={e => setNegoNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
}
