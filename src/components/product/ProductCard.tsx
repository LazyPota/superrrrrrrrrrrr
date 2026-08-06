'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Typography, Space, message, Badge } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, CheckCircleOutlined, PictureOutlined, MessageOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { addToCart, getUser, getDirectMessages, sendDirectMessage, toggleWishlist, isWishlisted } from '../../lib/store';

const { Title, Text } = Typography;

function formatPrice(price: number) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function ProductCard({ product }: { product: any }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [favored, setFavored] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  useEffect(() => {
    setFavored(isWishlisted(product.id));
  }, [product.id]);

  function handleToggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    setFavored(added);
    if (added) {
      messageApi.success('Produk disimpan ke Favorit!');
    } else {
      messageApi.info('Dihapus dari Favorit.');
    }
  }

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

  function handleStartChat() {
    const user = getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.email === product.sellerEmail) {
      messageApi.warning('Ini adalah produk jualan kamu sendiri.');
      return;
    }

    const existingMsgs = getDirectMessages();
    const found = existingMsgs.find(
      (m: any) =>
        (m.buyerEmail === user.email && m.sellerEmail === product.sellerEmail && m.productId === product.id) ||
        (m.sellerEmail === user.email && m.buyerEmail === product.sellerEmail && m.productId === product.id)
    );

    if (!found) {
      sendDirectMessage({
        sellerEmail: product.sellerEmail,
        sellerName: product.seller,
        buyerEmail: user.email,
        buyerName: user.name,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        proposedPrice: null,
        messageText: `Halo ${product.seller}, saya mau tanya-tanya mengenai produk ${product.name}.`,
        type: 'inquiry',
        status: 'chat',
      });
    }

    window.dispatchEvent(new CustomEvent('open-direct-chat'));
  }

  const coverImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  return (
    <>
      {contextHolder}
      <Badge.Ribbon text={isOutOfStock ? 'STOK HABIS' : product.category} color={isOutOfStock ? 'red' : 'blue'}>
        <Card
          hoverable
          style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', opacity: isOutOfStock ? 0.75 : 1 }}
          cover={
            <div style={{ height: 200, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Button
                type="text"
                shape="circle"
                icon={favored ? <HeartFilled style={{ color: '#ef4444', fontSize: 18 }} /> : <HeartOutlined style={{ color: '#64748b', fontSize: 18 }} />}
                onClick={handleToggleWishlist}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              />
              {coverImg ? (
                <img
                  alt={product.name}
                  src={coverImg}
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
            <Button
              type="text"
              icon={<MessageOutlined style={{ color: '#0052cc' }} />}
              onClick={handleStartChat}
              key="chat"
            >
              Chat
            </Button>,
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              key="cart"
              disabled={isOutOfStock}
              danger={isOutOfStock}
            >
              {isOutOfStock ? 'Habis' : 'Tambah'}
            </Button>,
          ]}
        >
          <div style={{ flex: 1 }}>
            <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8, height: 44, lineHeight: '22px' }}>
              {product.name}
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <Text type="danger" style={{ fontSize: 17, fontWeight: 800 }}>
                {formatPrice(product.price)}
              </Text>
              <Space size={4} wrap>
                <Tag color="purple" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>
                  {product.condition || 'Bekas - Like New'}
                </Tag>
                {isOutOfStock ? (
                  <Tag color="red" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Stok Habis</Tag>
                ) : (
                  <Tag color="green" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Stok: {product.stock ?? 1}</Tag>
                )}
                {product.allowNego !== false ? (
                  <Tag color="gold" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Nego</Tag>
                ) : (
                  <Tag color="default" style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>Pas</Tag>
                )}
              </Space>
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
