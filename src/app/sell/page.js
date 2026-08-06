'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Select, InputNumber, Button, Table, Popconfirm, Alert, Row, Col, Typography, Tag, Space, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, CloseOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUser, getProducts, addProduct, updateProduct, deleteProduct } from '../../lib/store';
import { isProductBlocked, getBlockReason } from '../../lib/blocked';
import CATEGORIES from '../../data/categories';
import SEED_PRODUCTS from '../../data/seed';

const { Title, Text, Paragraph } = Typography;

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function SellPage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState('');
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (!u) return;
    // BUG FIX #8: Merge seed products with stored products so seed items show up
    const stored = getProducts();
    const merged = new Map();
    SEED_PRODUCTS.forEach(p => merged.set(p.id, p));
    stored.forEach(p => merged.set(p.id, p));
    const all = Array.from(merged.values());
    const mine = all.filter(p => p.sellerEmail === u.email);
    setProducts(mine);
  }, []);

  function handleEdit(product) {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      allowNego: product.allowNego !== false,
      image: product.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingProduct(null);
    form.resetFields();
    setFormError('');
  }

  function handleDelete(id) {
    deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    messageApi.success('Produk berhasil dihapus.');
  }

  function onFinish(values) {
    setFormError('');

    if (isProductBlocked(values.name, values.description)) {
      setFormError(getBlockReason(values.name, values.description));
      return;
    }

    const productData = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category,
      allowNego: values.allowNego !== undefined ? values.allowNego : true,
      image: values.image ? values.image.trim() : '',
      seller: user.name,
      sellerEmail: user.email,
      sellerMajor: user.major,
      sellerBatch: user.batch,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      messageApi.success('Produk berhasil diperbarui!');
    } else {
      addProduct(productData);
      messageApi.success('Produk baru berhasil diterbitkan!');
    }

    handleCancelEdit();
    const mine = getProducts().filter(p => p.sellerEmail === user.email);
    setProducts(mine);
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 1240, margin: '48px auto', padding: '0 24px', minHeight: '60vh' }}>
          <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16 }}>
            <Title level={4}>Masuk Dulu Yuk</Title>
            <Paragraph type="secondary">Kamu harus masuk memakai email kampus sebelum bisa menjual barang di PresUMart.</Paragraph>
            <Link href="/login">
              <Button type="primary" size="large">Masuk Akun Kampus</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  const columns = [
    {
      title: 'Produk',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
            {record.image ? (
              <img src={record.image} alt={text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>No Foto</div>
            )}
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block' }}>{text}</Text>
            <Space size={4}>
              <Tag color="blue">{record.category}</Tag>
              {record.allowNego !== false ? (
                <Tag color="gold">Bisa Nego</Tag>
              ) : (
                <Tag color="default">Harga Pas</Tag>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: price => <Text strong style={{ color: '#0052cc' }}>{formatPrice(price)}</Text>,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Yakin ingin hapus produk ini?" onConfirm={() => handleDelete(record.id)} okText="Ya" cancelText="Batal">
            <Button danger icon={<DeleteOutlined />} type="text" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Navbar />
      <main style={{ maxWidth: 1240, margin: '32px auto', padding: '0 24px 48px 24px', minHeight: '60vh' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontWeight: 800, margin: 0 }}>
            Jual <span style={{ color: '#0052cc' }}>Barang</span>
          </Title>
          <Text type="secondary">
            Penjual Terverifikasi: {user.name} • {user.major} • Angkatan {user.batch}
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Form Card */}
          <Col xs={24} lg={10}>
            <Card
              title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              extra={editingProduct && <Button type="text" icon={<CloseOutlined />} onClick={handleCancelEdit}>Batal</Button>}
              style={{ borderRadius: 16 }}
            >
              {formError && <Alert title={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

              <Form form={form} layout="vertical" onFinish={onFinish} size="large" initialValues={{ allowNego: true }}>
                <Form.Item
                  label="Nama Produk"
                  name="name"
                  rules={[
                    { required: true, message: 'Nama produk wajib diisi!' },
                    { min: 3, message: 'Minimal 3 karakter!' },
                  ]}
                >
                  <Input placeholder="Contoh: Buku Kalkulus Edisi 9" />
                </Form.Item>

                <Form.Item
                  label="Deskripsi Produk"
                  name="description"
                  rules={[{ required: true, message: 'Deskripsi wajib diisi!' }]}
                >
                  <Input.TextArea rows={4} placeholder="Jelaskan kondisi barang, kelengkapan, dan keunggulan produk..." />
                </Form.Item>

                <Form.Item
                  label="Harga (Rupiah)"
                  name="price"
                  rules={[
                    { required: true, message: 'Harga wajib diisi!' },
                    { type: 'number', min: 100, message: 'Minimal Rp 100!' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={val => `Rp ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={val => val.replace(/Rp\s?|(\.*)/g, '')}
                    placeholder="50000"
                  />
                </Form.Item>

                <Form.Item
                  label="Kategori"
                  name="category"
                  rules={[{ required: true, message: 'Pilih kategori!' }]}
                >
                  <Select placeholder="Pilih Kategori" options={CATEGORIES.map(c => ({ label: c, value: c }))} />
                </Form.Item>

                <Form.Item
                  label="Opsi Negosiasi Harga"
                  name="allowNego"
                  valuePropName="checked"
                  extra="Jika diaktifkan, pembeli dapat mengajukan penawaran harga."
                >
                  <Switch checkedChildren="Nego Aktif" unCheckedChildren="Harga Pas" />
                </Form.Item>

                <Form.Item
                  label="Link Foto Produk (Opsional)"
                  name="image"
                >
                  <Input placeholder="Tempel URL gambar produk (https://...)" />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" block icon={<PlusOutlined />} style={{ height: 44, fontSize: 16, marginTop: 8 }}>
                  {editingProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Products List Table */}
          <Col xs={24} lg={14}>
            <Card title={`Daftar Produk Kamu (${products.length})`} style={{ borderRadius: 16 }}>
              <Table
                dataSource={products}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: 500 }}
              />
            </Card>
          </Col>
        </Row>
      </main>
      <Footer />
    </>
  );
}
