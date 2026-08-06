'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Table, Button, InputNumber, Popconfirm, Statistic, Row, Col, Typography, Empty, message, Tag, Space } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getUser, getCart, removeFromCart, updateCartQty, clearCart, sendDirectMessage } from '../../lib/store';

const { Title, Text } = Typography;

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setCart(getCart());
    setUser(getUser());
  }, []);

  function handleQty(id, qty) {
    setCart(updateCartQty(id, qty));
  }

  function handleRemove(id) {
    setCart(removeFromCart(id));
    messageApi.success('Barang dihapus dari keranjang.');
  }

  function handleClear() {
    setCart(clearCart());
    messageApi.success('Keranjang dikosongkan.');
  }

  function handleCheckout() {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    cart.forEach((item, index) => {
      // Add index offset to prevent ID collision when sending multiple orders at once
      setTimeout(() => {
        sendDirectMessage({
          sellerEmail: item.sellerEmail || 'unknown@student.president.ac.id',
          sellerName: item.seller || 'Penjual PresUniv',
          buyerEmail: user.email,
          buyerName: user.name,
          productId: item.id,
          productName: item.name,
          productPrice: item.price * item.qty,
          proposedPrice: null,
          messageText: `Pesanan COD baru (${item.qty}x ${item.name}). Total COD: ${formatPrice(item.price * item.qty)}`,
          type: 'order',
        });
      }, index * 50);
    });

    messageApi.success('Pesanan COD berhasil dibuat & dikirimkan ke Penjual!');
    setCart(clearCart());
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const columns = [
    {
      title: 'Produk',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
            {record.image ? (
              <img src={record.image} alt={text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>No Foto</div>
            )}
          </div>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block' }}>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Penjual: {record.seller}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: price => <Text>{formatPrice(price)}</Text>,
    },
    {
      title: 'Jumlah',
      dataIndex: 'qty',
      key: 'qty',
      render: (qty, record) => (
        <InputNumber
          min={1}
          max={99}
          value={qty}
          onChange={val => handleQty(record.id, val)}
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => <Text strong style={{ color: '#0052cc' }}>{formatPrice(record.price * record.qty)}</Text>,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Hapus produk ini dari keranjang?" onConfirm={() => handleRemove(record.id)} okText="Ya" cancelText="Batal">
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Navbar />
      <main style={{ maxWidth: 1240, margin: '32px auto', padding: '0 24px 48px 24px', minHeight: '60vh' }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 24 }}>
          Keranjang <span style={{ color: '#0052cc' }}>Saya</span>
        </Title>

        {!user ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16 }}>
            <Empty description={<Title level={4}>Silakan Masuk Terlebih Dahulu</Title>}>
              <Link href="/login">
                <Button type="primary" size="large">Masuk Akun Kampus</Button>
              </Link>
            </Empty>
          </Card>
        ) : cart.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16 }}>
            <Empty description={<Title level={4}>Keranjang Masih Kosong</Title>}>
              <Link href="/">
                <Button type="primary" size="large" icon={<ArrowLeftOutlined />}>Mulai Belanja</Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
                <Table
                  dataSource={cart}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 550 }}
                />
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                  <Link href="/">
                    <Button icon={<ArrowLeftOutlined />}>Lanjut Belanja</Button>
                  </Link>
                  <Popconfirm title="Kosongkan seluruh isi keranjang?" onConfirm={handleClear} okText="Ya" cancelText="Batal">
                    <Button danger icon={<DeleteOutlined />}>Kosongkan Keranjang</Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Title level={4} style={{ marginBottom: 16 }}>Ringkasan Pesanan</Title>

                <Card size="small" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: 16, borderRadius: 8 }}>
                  <Space direction="vertical" size={2}>
                    <Tag color="green" icon={<DollarOutlined />}>Metode Pembayaran: COD Only</Tag>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                      Pembayaran dilakukan secara tunai (Cash On Delivery) saat serah terima barang di lingkungan Kampus President University.
                    </Text>
                  </Space>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text type="secondary">Total Barang</Text>
                  <Text strong>{cart.reduce((a, i) => a + i.qty, 0)} item</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Text type="secondary">Total Harga COD</Text>
                  <Text strong style={{ fontSize: 22, color: '#0052cc' }}>{formatPrice(total)}</Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={handleCheckout}
                  style={{ height: 48, fontSize: 16, background: '#36b37e', borderColor: '#36b37e' }}
                >
                  Buat Pesanan COD
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </main>
      <Footer />
    </>
  );
}
