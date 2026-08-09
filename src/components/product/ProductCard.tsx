'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Typography, Space, message, Badge, Avatar } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, CheckCircleOutlined, PictureOutlined, MessageOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { addToCart, getUser, getDirectMessages, sendDirectMessage, toggleWishlist, isWishlisted } from '../../lib/store';

const { Title, Text } = Typography;

function formatPrice(price: number) {
  return 'Rp' + Number(price).toLocaleString('id-ID');
}

export default function ProductCard({ product }: { product: any }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [favored, setFavored] = useState(false);
  const [pulse, setPulse] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  useEffect(() => {
    setFavored(isWishlisted(product.id));
  }, [product.id]);

  function handleToggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const added = toggleWishlist(product.id);
    setFavored(added);
    
    setPulse(true);
    setTimeout(() => setPulse(false), 300);

    if (added) {
      messageApi.success('Produk disimpan ke Favorit!');
    } else {
      messageApi.info('Dihapus dari Favorit.');
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
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

  function handleStartChat(e: React.MouseEvent) {
    e.preventDefault();
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
      <style>{`
        .product-card {
          transition: all 0.3s ease;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          overflow: hidden;
          background: #ffffff;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: transparent;
        }
        .product-card .img-wrapper {
          overflow: hidden;
          position: relative;
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
        .product-img {
          transition: transform 0.4s ease;
        }
        .pulse-anim {
          animation: heartPulse 0.3s ease;
        }
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .action-button {
          transition: all 0.2s;
        }
        .action-button:hover {
          background: #f3f4f6;
          border-radius: 8px;
        }
      `}</style>
      {contextHolder}
      <Badge.Ribbon 
        text={isOutOfStock ? 'STOK HABIS' : product.category} 
        color={isOutOfStock ? '#ef4444' : '#e0e7ff'}
        style={{ color: isOutOfStock ? '#fff' : '#4338ca', fontWeight: 600, fontSize: 12 }}
      >
        <Card
          hoverable
          className="product-card"
          style={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isOutOfStock ? 0.75 : 1 }}
          styles={{ body: { padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' } }}
          actions={[
            <Link href={`/product?id=${product.id}`} key="detail">
              <Button type="text" className="action-button" icon={<EyeOutlined style={{ fontSize: 20, color: '#64748b' }} />} />
            </Link>,
            <Button
              type="text"
              className="action-button"
              icon={<MessageOutlined style={{ fontSize: 20, color: '#3b82f6' }} />}
              onClick={handleStartChat}
              key="chat"
            />,
            <Button
              type="text"
              className="action-button"
              icon={<ShoppingCartOutlined style={{ fontSize: 20, color: isOutOfStock ? '#ef4444' : '#10b981' }} />}
              onClick={handleAddToCart}
              key="cart"
              disabled={isOutOfStock}
            />,
          ]}
          cover={
            <div className="img-wrapper" style={{ height: 220, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button
                type="text"
                shape="circle"
                className={pulse ? 'pulse-anim' : ''}
                icon={favored ? <HeartFilled style={{ color: '#ef4444', fontSize: 20 }} /> : <HeartOutlined style={{ color: '#64748b', fontSize: 20 }} />}
                onClick={handleToggleWishlist}
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36
                }}
              />
              {coverImg ? (
                <>
                  <img
                    alt={product.name}
                    src={coverImg}
                    className="product-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none'
                  }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
                  <PictureOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Tidak ada foto</div>
                </div>
              )}
            </div>
          }
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0, minHeight: 38, fontSize: 'clamp(13px, 3.5vw, 16px)', lineHeight: '1.35', fontWeight: 600, color: '#1e293b' }}>
              {product.name}
            </Title>

            <div style={{ margin: '6px 0 10px 0' }}>
              <Text style={{ 
                fontSize: 'clamp(15px, 4vw, 20px)', 
                fontWeight: 800, 
                display: 'block',
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
                {formatPrice(product.price)}
              </Text>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 'auto' }}>
              <Tag color="#f1f5f9" style={{ color: '#475569', border: 'none', fontSize: 11, borderRadius: 6, padding: '2px 8px', margin: 0, fontWeight: 500 }}>
                {product.condition || 'Bekas - Like New'}
              </Tag>
              {isOutOfStock ? (
                <Tag color="#fee2e2" style={{ color: '#ef4444', border: 'none', fontSize: 11, borderRadius: 6, padding: '2px 8px', margin: 0, fontWeight: 600 }}>Stok Habis</Tag>
              ) : (
                <Tag color="#dcfce7" style={{ color: '#16a34a', border: 'none', fontSize: 11, borderRadius: 6, padding: '2px 8px', margin: 0, fontWeight: 500 }}>Stok: {product.stock ?? 1}</Tag>
              )}
              {product.allowNego !== false ? (
                <Tag color="#fef3c7" style={{ color: '#d97706', border: 'none', fontSize: 11, borderRadius: 6, padding: '2px 8px', margin: 0, fontWeight: 500 }}>Nego</Tag>
              ) : (
                <Tag color="#f3f4f6" style={{ color: '#6b7280', border: 'none', fontSize: 11, borderRadius: 6, padding: '2px 8px', margin: 0, fontWeight: 500 }}>Harga Pas</Tag>
              )}
            </div>
            
            <div style={{ 
              marginTop: 16, 
              paddingTop: 12, 
              borderTop: '1px solid #f1f5f9', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <Avatar 
                size={24} 
                style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: 12, fontWeight: 600 }}
              >
                {product.seller ? product.seller.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Text style={{ fontSize: 13, color: '#334155', fontWeight: 500 }} ellipsis>
                  {product.seller}
                </Text>
                {product.sellerMajor && (
                  <Text type="secondary" style={{ fontSize: 11, marginTop: -2 }} ellipsis>
                    {product.sellerMajor}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Badge.Ribbon>
    </>
  );
}
