'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Typography, Space, message, Avatar, Tooltip } from 'antd';
import { 
  ShoppingCartOutlined, 
  MessageOutlined, 
  HeartOutlined, 
  HeartFilled, 
  UserOutlined, 
  ShopOutlined, 
  TagOutlined 
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

  function handleToggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const added = toggleWishlist(product.id);
    setFavored(added);
    if (added) {
      messageApi.success('Disimpan ke Favorit!');
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
      messageApi.error('Maaf, stok habis.');
      return;
    }
    addToCart(product);
    messageApi.success('Berhasil ditambah ke keranjang!');
  }

  function handleStartChat(e: React.MouseEvent) {
    e.preventDefault();
    const user = getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.email === product.sellerEmail) {
      messageApi.warning('Ini produk kamu sendiri.');
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
      messageText: `Halo ${product.seller}, saya berminat dengan produk ${product.name}.`,
      type: 'inquiry',
      status: 'chat',
    });

    window.dispatchEvent(new CustomEvent('open-direct-chat'));
  }

  const coverImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  return (
    <div className="neo-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isOutOfStock ? 0.85 : 1 }}>
      {contextHolder}

      {/* Image Container with Neobrutalism Border */}
      <Link href={`/product?id=${product.id}`}>
        <div style={{ height: 200, background: '#f4f4f0', borderBottom: '3px solid #000000', position: 'relative', overflow: 'hidden' }}>
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 10,
              background: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #000000',
              borderRadius: 8,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {favored ? <HeartFilled style={{ color: '#ff2a85', fontSize: 16 }} /> : <HeartOutlined style={{ color: '#000000', fontSize: 16 }} />}
          </button>

          {/* Condition Tag */}
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            {isOutOfStock ? (
              <span className="neo-tag" style={{ background: '#ff2a85', color: '#ffffff' }}>❌ HABIS</span>
            ) : (
              <span className="neo-tag" style={{ background: '#00f0ff' }}>{product.condition || 'Bekas - Like New'}</span>
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
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000000' }}>
              <ShopOutlined style={{ fontSize: 36, marginBottom: 4 }} />
              <Text strong style={{ fontSize: 11 }}>TIDAK ADA FOTO</Text>
            </div>
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="neo-tag" style={{ background: '#ffe600', fontSize: 10 }}>{product.category}</span>
            {product.allowNego !== false && (
              <span className="neo-tag" style={{ background: '#00e676', fontSize: 10 }}>NEGO OK</span>
            )}
          </div>

          <Link href={`/product?id=${product.id}`}>
            <Title
              level={5}
              style={{
                margin: '6px 0 8px 0',
                fontWeight: 900,
                fontSize: 15,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 40,
                color: '#000000',
                fontFamily: 'Syne, sans-serif'
              }}
            >
              {product.name}
            </Title>
          </Link>

          {/* Big Price Display */}
          <div style={{ margin: '8px 0 12px 0' }}>
            <span style={{
              background: '#000000',
              color: '#ffe600',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 900,
              fontSize: 16,
              padding: '4px 12px',
              borderRadius: 8,
              display: 'inline-block',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #ff2a85'
            }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        <div>
          {/* Seller Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 8,
            background: '#faf9f6',
            border: '2px solid #000000',
            marginBottom: 10
          }}>
            <Avatar size={22} style={{ backgroundColor: '#ff2a85', color: '#ffffff', fontWeight: 900 }} icon={<UserOutlined />}>
              {product.seller ? product.seller.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text strong ellipsis style={{ fontSize: 11, display: 'block', lineHeight: 1.2, color: '#000000' }}>
                {product.seller}
              </Text>
              <Text ellipsis style={{ fontSize: 9, fontWeight: 700, display: 'block', color: '#666' }}>
                {product.sellerMajor || 'President Univ'}
              </Text>
            </div>
          </div>

          {/* Neobrutalist Action Buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleStartChat}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000',
                borderRadius: 10,
                fontWeight: 900,
                fontSize: 12,
                padding: '8px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <MessageOutlined /> Chat
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                flex: 1.4,
                background: isOutOfStock ? '#ccc' : '#ffe600',
                border: '2px solid #000000',
                boxShadow: isOutOfStock ? 'none' : '2px 2px 0px #000000',
                borderRadius: 10,
                fontWeight: 900,
                fontSize: 12,
                padding: '8px 0',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <ShoppingCartOutlined /> Beli!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
