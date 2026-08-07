'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Popconfirm, Input, Badge, Button, Dropdown, Avatar, Space, Tag, notification } from 'antd';
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
  HeartOutlined,
} from '@ant-design/icons';
import { getUser, getCart, removeUser, getDirectMessages, syncWithServer, speakVoice, playOrderSound } from '../../lib/store';
import DirectChatDrawer from '../chat/DirectChatDrawer';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
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

      notification.info({
        title: '🔔 Pesan / Orderan Baru Masuk!',
        description: 'Ada aktivitas percakapan baru di PresUMart. Klik di sini untuk membuka kotak pesan.',
        placement: 'topRight',
        onClick: () => {
          setDirectDrawerOpen(true);
        },
        duration: 5,
      });
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

  function handleSearch(value: string) {
    if (!value || !value.trim()) return;
    router.push(`/?search=${encodeURIComponent(value.trim())}`);
  }

  function handleLogout() {
    removeUser();
    setUser(null);
    speakVoice('Berhasil keluar akun.');
    router.push('/login');
  }

  const userMenuItems: any[] = [
    {
      key: 'profile',
      icon: <UserOutlined style={{ color: '#0052cc' }} />,
      label: <Link href="/profile" style={{ fontWeight: 600 }}>Profil Saya & Wishlist</Link>,
    },
    {
      key: 'sell',
      icon: <PlusCircleOutlined style={{ color: '#36b37e' }} />,
      label: <Link href="/sell" style={{ fontWeight: 600 }}>Jual Barang Baru</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar Akun (Logout)',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000 }}>
        {/* Top Banner Utility Bar */}
        <div style={{ background: '#002b66', color: '#e6f0ff', padding: '6px 16px', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span>🎓 PresUMart • Marketplace Resmi Mahasiswa President University</span>
          <div>
            {user ? (
              <Space size="middle" align="center">
                <span className="hide-mobile">👤 Halo, <b>{user.name}</b> ({user.email})</span>
                <Popconfirm title="Apakah kamu yakin ingin keluar akun?" onConfirm={handleLogout} okText="Ya, Keluar" cancelText="Batal">
                  <Button type="link" size="small" icon={<LogoutOutlined />} style={{ color: '#ff85c0', padding: 0, height: 'auto', fontWeight: 700 }}>
                    Keluar (Logout)
                  </Button>
                </Popconfirm>
              </Space>
            ) : (
              <Space size="small" align="center">
                <span>Belum punya akun?</span>
                <Link href="/login" style={{ color: '#93c5fd', fontWeight: 700, textDecoration: 'underline' }}>🔑 Masuk (Sign In)</Link>
                <span style={{ color: '#475569' }}>|</span>
                <Link href="/register" style={{ color: '#6ee7b7', fontWeight: 700, textDecoration: 'underline' }}>📝 Daftar (Sign Up)</Link>
              </Space>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <ShopOutlined style={{ fontSize: 26, color: '#0052cc' }} />
            <div>
              <span style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Pres<span style={{ color: '#0052cc' }}>U</span>Mart
              </span>
              <Tag color="blue" style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>
                PRESUNIV
              </Tag>
            </div>
          </Link>

          {/* Search Bar */}
          <div style={{ flex: '1 1 180px', maxWidth: 480, minWidth: 140 }}>
            <Input.Search
              placeholder="Cari barang, buku, baju..."
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Cari</Button>}
              size="middle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </div>

          {/* User Action Buttons */}
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
                  <Button type="primary" size="middle" icon={<PlusCircleOutlined />} style={{ background: '#36b37e', borderColor: '#36b37e', fontWeight: 600 }}>
                    <span className="hide-mobile">Jual Barang</span>
                  </Button>
                </Link>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                  <Button size="middle" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', borderColor: '#0052cc' }}>
                    <Avatar size="small" style={{ backgroundColor: '#0052cc' }} icon={<UserOutlined />}>
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <span style={{ fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                  </Button>
                </Dropdown>

                <Popconfirm title="Apakah kamu yakin ingin keluar akun?" onConfirm={handleLogout} okText="Ya, Keluar" cancelText="Batal">
                  <Button danger size="middle" icon={<LogoutOutlined />} title="Keluar Akun (Logout)">
                    <span className="hide-mobile">Keluar</span>
                  </Button>
                </Popconfirm>
              </Space>
            ) : (
              <Space size="small">
                <Link href="/login">
                  <Button type="primary" size="middle" icon={<LoginOutlined />} style={{ background: '#0052cc', fontWeight: 700 }}>
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button type="default" size="middle" icon={<UserAddOutlined />} style={{ fontWeight: 600, borderColor: '#0052cc', color: '#0052cc' }}>
                    Daftar
                  </Button>
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
