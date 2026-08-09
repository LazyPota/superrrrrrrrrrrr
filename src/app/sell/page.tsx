'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Select, InputNumber, Button, Table, Popconfirm, Alert, Row, Col, Typography, Tag, Space, message, Switch, Upload, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, CloseOutlined, CheckCircleOutlined, DollarOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getUser, getProducts, addProduct, updateProduct, deleteProduct } from '../../lib/store';
import { isProductBlocked, getBlockReason } from '../../lib/blocked';
import CATEGORIES from '../../data/categories';
import SEED_PRODUCTS from '../../data/seed';

const { Title, Text, Paragraph } = Typography;

const compressAndResizeImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 800; // Max 800px width/height for sharp product view & tiny file size
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG quality 0.7 (reduces file size by 95%+ down to ~30-50KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = err => reject(err);
    };
    reader.onerror = err => reject(err);
  });

function formatPrice(price: number) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function SellPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  function refreshMyProducts() {
    const u = getUser();
    setUser(u);
    if (!u) return;
    const stored = getProducts();
    const mine = stored.filter(p => p.sellerEmail === u.email);
    setProducts(mine);
  }

  useEffect(() => {
    refreshMyProducts();

    if (typeof window !== 'undefined') {
      window.addEventListener('products-updated', refreshMyProducts);
      window.addEventListener('storage', refreshMyProducts);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('products-updated', refreshMyProducts);
        window.removeEventListener('storage', refreshMyProducts);
      }
    };
  }, []);

  const handleUploadChange = async ({ fileList: newFileList }: any) => {
    const updatedList = await Promise.all(
      newFileList.map(async (file: any) => {
        if (file.originFileObj && !file.url && !file.thumbUrl) {
          file.url = await compressAndResizeImage(file.originFileObj);
        }
        return file;
      })
    );
    setFileList(updatedList);
  };

  function handleEdit(product: any) {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition || 'Bekas - Like New',
      stock: product.stock !== undefined ? product.stock : 1,
      allowNego: product.allowNego !== false,
      image: product.image || '',
    });
    if (product.images && product.images.length > 0) {
      setFileList(product.images.map((url: string, index: number) => ({ uid: `-${index}`, name: `photo-${index}.png`, status: 'done', url })));
    } else if (product.image) {
      setFileList([{ uid: '-1', name: 'photo-1.png', status: 'done', url: product.image }]);
    } else {
      setFileList([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
    setFormError('');
  }

  function handleDelete(id: string) {
    deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    messageApi.success('Produk berhasil dihapus.');
  }

  function onFinish(values: any) {
    setFormError('');

    if (isProductBlocked(values.name, values.description)) {
      setFormError(getBlockReason(values.name, values.description));
      return;
    }

    const uploadedImages = fileList.map(f => f.url || f.thumbUrl).filter(Boolean);
    const coverImage = uploadedImages[0] || (values.image ? values.image.trim() : '');

    const productData = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category,
      condition: values.condition || 'Bekas - Like New',
      stock: Number(values.stock !== undefined ? values.stock : 1),
      allowNego: values.allowNego !== undefined ? values.allowNego : true,
      image: coverImage,
      images: uploadedImages.length > 0 ? uploadedImages : (coverImage ? [coverImage] : []),
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
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: any) => (
        (stock !== undefined && stock <= 0) || record.status === 'sold' ? (
          <Tag color="red" style={{ fontWeight: 700 }}>Terjual / Habis (0)</Tag>
        ) : (
          <Tag color="green">{stock ?? 1} unit</Tag>
        )
      ),
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

  if (!user) {
    return (
      <>
        {contextHolder}
        <Navbar />
        <main style={{ maxWidth: 1240, margin: '48px auto', padding: '0 24px', minHeight: '60vh' }}>
          <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16 }}>
            <Empty description={<Title level={4}>Anda Belum Login</Title>}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Silakan masuk akun kampus President University untuk menjual produk atau mengelola toko kamu.
              </Text>
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
              {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

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
                  label="Kondisi Barang"
                  name="condition"
                  initialValue="Bekas - Like New"
                  rules={[{ required: true, message: 'Pilih kondisi barang!' }]}
                >
                  <Select
                    options={[
                      { label: '✨ Barang Baru (New 100%)', value: 'Barang Baru' },
                      { label: '🌟 Bekas - Seperti Baru (Like New)', value: 'Bekas - Like New' },
                      { label: '👍 Bekas - Mulus / Wajar', value: 'Bekas - Mulus' },
                      { label: '🔧 Bekas - Butuh Perbaikan', value: 'Bekas - Butuh Perbaikan' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Jumlah Stok Barang"
                  name="stock"
                  rules={[
                    { required: true, message: 'Jumlah stok wajib diisi!' },
                    { type: 'number', min: 0, message: 'Stok minimal 0!' },
                  ]}
                  initialValue={1}
                  extra="Jika stok habis (0), produk otomatis tidak dapat dibeli oleh pembeli."
                >
                  <InputNumber min={0} max={999} style={{ width: '100%' }} placeholder="1" />
                </Form.Item>

                <Form.Item
                  label="Opsi Negosiasi Harga"
                  name="allowNego"
                  valuePropName="checked"
                  extra="Jika diaktifkan, pembeli dapat mengajukan penawaran harga."
                >
                  <Switch checkedChildren="Nego Aktif" unCheckedChildren="Harga Pas" />
                </Form.Item>

                <Form.Item label="Upload Foto Produk (Maksimal 3 Foto)">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                    maxCount={3}
                    accept="image/*"
                  >
                    {fileList.length < 3 && (
                      <div style={{ textAlign: 'center' }}>
                        <CameraOutlined style={{ fontSize: 20, color: '#0052cc' }} />
                        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600 }}>Upload ({fileList.length}/3)</div>
                      </div>
                    )}
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Unggah hingga 3 foto produk dari perangkat/HP.
                  </Text>
                </Form.Item>

                <Form.Item
                  label="Atau Tempel Link URL Foto (Opsional)"
                  name="image"
                >
                  <Input placeholder="https://..." />
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
