'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Typography, Space, message, Badge, Avatar, Tooltip } from 'antd';
import { 
  ShoppingCartOutlined, EyeOutlined, CheckCircleOutlined, 
  MessageOutlined, HeartOutlined, HeartFilled, ShareAltOutlined,
  UserOutlined, ShopOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { addToCart, getUser, sendDirectMessage, toggleWishlist, isWishlisted } from '../../lib/store';

const { Title, Text } = Typography;

function formatPrice(price: number) {
  const num = Number(price);
  if (isNaN(num) || num < 0) return 'Rp0';
  return 'Rp' + Math.floor(num).toLocaleString('id-ID');
}

export default function ProductCard({ product }: { product: any }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [favored, setFavored] = useState(false);
  const isOutOfStock = (product.stock !== undefined && product.stock <= 0) || product.status === 'sold';

  useEffect(() => {
    setFavored(isWishlisted(product.id));
  }, [product.id]);

  function handleShareProduct(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://presumart.netlify.app';
    const shortUrl = `${origin}/product?id=${product.id}`;
    const formattedPrice = formatPrice(product.price);
    const shareText = `🛒 *${product.name}* (${formattedPrice})\nBeli di PresUMart President University: ${shortUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${product.name} - PresUMart`,
        text: shareText,
        url: shortUrl,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shortUrl).then(() => {
        messageApi.success('Link produk berhasil disalin!');
      }).catch(() => {
        messageApi.info(`Link produk: ${shortUrl}`);
      });
    } else {
      messageApi.info(`Link produk: ${shortUrl}`);
    }
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const added = toggleWishlist(product.id);
    setFavored(added);
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
      messageApi.error('Maaf, produk ini telah TERJUAL / Stok Habis.');
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

    window.dispatchEvent(new CustomEvent('open-direct-chat'));
  }

  const coverImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  return (
    <div className="bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isOutOfStock ? 0.8 : 1 }}>
      {contextHolder}

      {/* Image Preview Container */}
      <Link href={`/product?id=${product.id}`}>
        <div className="img-wrapper" style={{ height: 210, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
          {/* Top Heart Wishlist Button */}
          <Button
            type="text"
            shape="circle"
            onClick={handleToggleWishlist}
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            icon={
              favored ? (
                <HeartFilled style={{ color: '#ef4444', fontSize: 18 }} />
              ) : (
                <HeartOutlined style={{ color: '#64748b', fontSize: 18 }} />
              )
            }
          />

          {/* Price Pill Badge (Top Right) */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
            <span className="price-pill-badge">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Condition Tag (Top Right Floating) */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
            {isOutOfStock ? (
              <Tag color="red" style={{ fontWeight: 800, borderRadius: 20, padding: '2px 10px', margin: 0 }}>
                ❌ TERJUAL
              </Tag>
            ) : (
              <Tag color="blue" style={{ fontWeight: 700, borderRadius: 20, padding: '2px 10px', margin: 0 }}>
                {product.condition || 'Bekas - Like New'}
              </Tag>
            )}
          </div>

          {coverImg ? (
            <img
              src={coverImg}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <ShopOutlined style={{ fontSize: 36, marginBottom: 4 }} />
              <Text type="secondary" style={{ fontSize: 11 }}>Tidak Ada Foto</Text>
            </div>
          )}
        </div>
      </Link>

      {/* Card Content Area */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Tag color="cyan" style={{ margin: 0, fontSize: 11, fontWeight: 700, borderRadius: 6 }}>
              {product.category}
            </Tag>
            {product.allowNego !== false && (
              <Tag color="gold" style={{ margin: 0, fontSize: 10, fontWeight: 800, borderRadius: 6 }}>
                Nego
              </Tag>
            )}
          </div>

          <Link href={`/product?id=${product.id}`}>
            <Title
              level={5}
              style={{
                margin: '4px 0 10px 0',
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 40,
                color: '#0f172a'
              }}
            >
              {product.name}
            </Title>
          </Link>
        </div>

        <div>
          {/* Seller Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12, background: '#f8fafc', marginBottom: 12, border: '1px solid #f1f5f9' }}>
            <Avatar size={24} style={{ backgroundColor: '#0052cc', fontSize: 11 }} icon={<UserOutlined />}>
              {product.seller ? product.seller.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text strong ellipsis style={{ fontSize: 12, display: 'block', lineHeight: 1.2, color: '#1e293b' }}>
                {product.seller}
              </Text>
              <Text type="secondary" ellipsis style={{ fontSize: 10, display: 'block' }}>
                {product.sellerMajor || 'President Univ'}
              </Text>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="Tanya Penjual">
              <Button
                block
                icon={<MessageOutlined style={{ color: '#0052cc', fontSize: 16 }} />}
                onClick={handleStartChat}
                style={{ borderRadius: 12, borderColor: '#cbd5e1', height: 38 }}
              />
            </Tooltip>

            <Button
              type="primary"
              block
              icon={<ShoppingCartOutlined style={{ fontSize: 16 }} />}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                borderRadius: 12,
                fontWeight: 800,
                height: 38,
                background: isOutOfStock ? '#94a3b8' : 'linear-gradient(135deg, #0052cc 0%, #003399 100%)',
                border: 'none',
                boxShadow: isOutOfStock ? 'none' : '0 4px 14px rgba(0, 82, 204, 0.3)'
              }}
            >
              {isOutOfStock ? 'Habis' : '+ Keranjang'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
