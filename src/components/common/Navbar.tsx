'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Badge, Button, Dropdown, Avatar, Space, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  ShopOutlined,
  SearchOutlined,
  LoginOutlined,
  UserAddOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { getUser, getCart, removeUser, getDirectMessages, syncWithServer, speakVoice, playOrderSound } from '../../lib/store';
import DirectChatDrawer from '../chat/DirectChatDrawer';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [directDrawerOpen, setDirectDrawerOpen] = useState(false);
  const router = useRouter();

  // Refresh user state, cart count, and unread messages
  function refreshState() {
    const u = getUser();
    setUser(u);
    const cart = getCart();
    setCartCount(cart.reduce((acc, i) => acc + i.qty, 0));

    if (u) {
      const msgs = getDirectMessages();
      const unread = msgs.filter(
        m => (m.sellerEmail === u.email && m.unreadBySeller) || (m.buyerEmail === u.email && m.unreadByBuyer)
      ).length;
      
      setUnreadCount(unread);
    }
  }

  useEffect(() => {
    refreshState();

    // Cross-device sync interval every 3 seconds
    const interval = setInterval(() => {
      syncWithServer().then(() => refreshState());
    }, 3000);

    function handleOpenDirectChat() {
      setDirectDrawerOpen(true);
    }
    function handleCartUpdated() {
      const cart = getCart();
      setCartCount(cart.reduce((acc, i) => acc + i.qty, 0));
    }
    function handleMessagesUpdated() {
      refreshState();
    }
    function handleNewIncomingMessage() {
      playOrderSound();
      speakVoice('Ada pesan masuk!');
      refreshState();
    }

    window.addEventListener('open-direct-chat', handleOpenDirectChat);
    window.addEventListener('cart-updated', handleCartUpdated);
    window.addEventListener('messages-updated', handleMessagesUpdated);
    window.addEventListener('new-incoming-message', handleNewIncomingMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('open-direct-chat', handleOpenDirectChat);
      window.removeEventListener('cart-updated', handleCartUpdated);
      window.removeEventListener('messages-updated', handleMessagesUpdated);
      window.removeEventListener('new-incoming-message', handleNewIncomingMessage);
    };
  }, [directDrawerOpen]);

  function handleSearch(value) {
    if (!value || !value.trim()) return;
    router.push(`/?search=${encodeURIComponent(value.trim())}`);
  }

  function handleLogout() {
    removeUser();
    setUser(null);
    router.push('/login');
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Profil Saya</Link>,
    },
    {
      key: 'sell',
      icon: <PlusCircleOutlined />,
      label: <Link href="/sell">Jual Barang</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Keluar',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000 }}>
        {/* Top Banner Bar */}
        <div style={{ background: '#002b66', color: '#e6f0ff', padding: '6px 16px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <span>🎓 PresUMart - Marketplace Resmi Mahasiswa PresUniv</span>
          <span className="hide-mobile">📍 President University • Kampus Jababeka</span>
        </div>

        {/* Main Navbar */}
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <ShopOutlined style={{ fontSize: 24, color: '#0052cc' }} />
            <div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Pres<span style={{ color: '#0052cc' }}>U</span>Mart
              </span>
              <Tag color="blue" style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>
                PRESUNIV
              </Tag>
            </div>
          </Link>

          {/* Search Bar */}
          <div style={{ flex: '1 1 240px', maxWidth: 500, minWidth: 200 }}>
            <Input.Search
              placeholder="Cari produk di PresUMart..."
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Cari</Button>}
              size="middle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </div>

          {/* Actions */}
          <Space size="small" align="center" style={{ flexWrap: 'nowrap' }}>
            {user && (
              <Badge count={unreadCount} overflowCount={99} color="#ff4d4f">
                <Button
                  type="default"
                  size="middle"
                  icon={<MessageOutlined style={{ fontSize: 16, color: '#0052cc' }} />}
                  onClick={() => setDirectDrawerOpen(true)}
                  title="Orderan & Pesan"
                >
                  <span className="hide-mobile">Pesan</span>
                </Button>
              </Badge>
            )}

            <Link href="/cart">
              <Badge count={cartCount} showZero overflowCount={99} color="#0052cc">
                <Button type="default" size="middle" icon={<ShoppingCartOutlined style={{ fontSize: 16 }} />} title="Keranjang">
                  <span className="hide-mobile">Keranjang</span>
                </Button>
              </Badge>
            </Link>

            {user ? (
              <Space size="small">
                <Link href="/sell">
                  <Button type="primary" size="middle" icon={<PlusCircleOutlined />} title="Jual Barang">
                    <span className="hide-mobile">Jual</span>
                  </Button>
                </Link>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                  <Button size="middle" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#0052cc' }} icon={<UserOutlined />}>
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <span className="hide-mobile" style={{ fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                  </Button>
                </Dropdown>
              </Space>
            ) : (
              <Space size="small">
                <Link href="/login">
                  <Button size="middle" icon={<LoginOutlined />}>Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary" size="middle" icon={<UserAddOutlined />}>Daftar</Button>
                </Link>
              </Space>
            )}
          </Space>
        </div>
      </header>

      <DirectChatDrawer
        open={directDrawerOpen}
        onClose={() => setDirectDrawerOpen(false)}
      />
    </>
  );
}
