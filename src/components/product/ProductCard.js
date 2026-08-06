'use client';

import Link from 'next/link';
import { Card, Tag, Button, Typography, Space, message, Badge } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, CheckCircleOutlined, PictureOutlined } from '@ant-design/icons';
import { addToCart, getUser } from '../../lib/store';

const { Title, Text } = Typography;

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function ProductCard({ product }) {
  const [messageApi, contextHolder] = message.useMessage();

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
    addToCart(product);
    messageApi.success('Produk berhasil ditambahkan ke keranjang!');
  }

  return (
    <>
      {contextHolder}
      <Badge.Ribbon text={product.category} color="blue">
        <Card
          hoverable
          style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}
          cover={
            <div style={{ height: 200, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {product.image ? (
                <img
                  alt={product.name}
                  src={product.image}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <PictureOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                  <div style={{ fontSize: 12 }}>Tidak ada foto</div>
                </div>
              )}
            </div>
          }
          actions={[
            <Link href={`/product?id=${product.id}`} key="detail">
              <Button type="text" icon={<EyeOutlined />}>
                Detail
              </Button>
            </Link>,
            <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleAddToCart} key="cart">
              Tambah
            </Button>,
          ]}
        >
          <div style={{ flex: 1 }}>
            <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8, height: 44, lineHeight: '22px' }}>
              {product.name}
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="danger" style={{ fontSize: 17, fontWeight: 800 }}>
                {formatPrice(product.price)}
              </Text>
              {product.allowNego !== false ? (
                <Tag color="gold" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Bisa Nego</Tag>
              ) : (
                <Tag color="default" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Harga Pas</Tag>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <CheckCircleOutlined style={{ color: '#36b37e', fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                {product.seller} ({product.sellerMajor || 'PresUniv'})
              </Text>
            </div>
          </div>
        </Card>
      </Badge.Ribbon>
    </>
  );
}
