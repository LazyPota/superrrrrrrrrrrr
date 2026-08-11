'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Input, Badge, Button, Dropdown, Avatar, Tooltip, notification } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  ShopOutlined,
  MessageOutlined,
  HomeOutlined,
  SearchOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  FireOutlined
} from '@ant-design/icons';
import { getUser, getCart, removeUser, getDirectMessages, syncWithServer, speakVoice, playOrderSound } from '../../lib/store';
import DirectChatDrawer from '../chat/DirectChatDrawer';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [directDrawerOpen, setDirectDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function refreshState() {
    const u = getUser();
    setUser(u);
    const cart = getCart();
    setCartCount(cart.reduce((acc, i) => acc + i.qty, 0));
    if (u) {
      const msgs = getDirectMessages();
      const unread = msgs.filter(m => {
        if (m.deleted) return false;
        if (m.sellerEmail === u.email && m.deletedBySeller) return false;
        if (m.buyerEmail === u.email && m.deletedByBuyer) return false;
        return (m.sellerEmail === u.email && m.unreadBySeller) || (m.buyerEmail === u.email && m.unreadByBuyer);
      }).length;
      setUnreadCount(unread);
    }
  }

  useEffect(() => {
    refreshState();
    const interval = setInterval(() => {
      syncWithServer().then(() => refreshState());
    }, 3000);

    function handleOpenDirectChat() { setDirectDrawerOpen(true); }
    function handleCartUpdated() {
      const cart = getCart();
      setCartCount(cart.reduce((acc, i) => acc + i.qty, 0));
    }
    function handleMessagesUpdated() { refreshState(); }
    function handleNewIncomingMessage() {
      playOrderSound();
      speakVoice('Ada pesan masuk!');
      refreshState();
      
      notification.info({
        message: '🔔 Pesan / Orderan Baru Masuk!',
        description: 'Ada aktivitas percakapan baru di PresUMart.',
        placement: 'topRight',
        onClick: () => { setDirectDrawerOpen(true); },
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
  }, [user]);

  function handleLogout() {
    removeUser();
    refreshState();
    router.push('/');
  }

  function handleSearch(value: string) {
    if (value.trim()) {
      router.push(`/?search=${encodeURIComponent(value.trim())}`);
    } else {
      router.push('/');
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontWeight: 600 }}>
          <UserOutlined style={{ color: '#00f2fe' }} />
          <span>Profil Saya</span>
        </Link>
      ),
    },
    {
      key: 'orders',
      label: (
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontWeight: 600 }}>
          <HistoryOutlined style={{ color: '#0052cc' }} />
          <span>Riwayat Pesanan</span>
        </Link>
      ),
    },
    {
      key: 'sell',
      label: (
        <Link href="/sell" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontWeight: 600 }}>
          <ShopOutlined style={{ color: '#10b981' }} />
          <span>Kelola Jualanku</span>
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontWeight: 600, cursor: 'pointer' }}>
          <LogoutOutlined />
          <span>Keluar Akun</span>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Top Running Live Ticker Bar */}
      <div className="ticker-wrap">
        <div className="ticker-move">
          <span className="ticker-item"><FireOutlined style={{ color: '#f59e0b' }} /> MARKETPLACE RESMI PRESIDENT UNIVERSITY</span>
          <span className="ticker-item">● COD LANGSUNG KAMPUS JABABEKAN</span>
          <span className="ticker-item"><ThunderboltOutlined style={{ color: '#00f2fe' }} /> 0% BIAYA ADMIN UNTUK MAHASISWA</span>
          <span className="ticker-item">● TERVERIFIKASI EMAIL KAMPUS @PRESIDENT.AC.ID</span>
          <span className="ticker-item"><FireOutlined style={{ color: '#f59e0b' }} /> MARKETPLACE RESMI PRESIDENT UNIVERSITY</span>
          <span className="ticker-item">● COD LANGSUNG KAMPUS JABABEKAN</span>
          <span className="ticker-item"><ThunderboltOutlined style={{ color: '#00f2fe' }} /> 0% BIAYA ADMIN UNTUK MAHASISWA</span>
        </div>
      </div>

      {/* Floating macOS Dock / Dynamic Island Nav Bar */}
      <div style={{ height: 76 }}>
        <nav className="floating-dock-nav">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            {/* Brand Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 99,
                background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}>
                <ShopOutlined style={{ fontSize: 20, color: '#090d16' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', fontFamily: 'Syne', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  Pres<span className="glow-text-cyan">U</span>Mart
                </span>
                <span className="hide-mobile" style={{ fontSize: 8, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                  Campus Store
                </span>
              </div>
            </Link>

            {/* Quick Search Box */}
            <div className="hide-mobile" style={{ flex: 1, maxWidth: 440, margin: '0 12px' }}>
              <Input.Search
                placeholder="Cari buku, barang kost, gadget..."
                onSearch={handleSearch}
                size="middle"
                style={{ borderRadius: 99, overflow: 'hidden' }}
                enterButton
              />
            </div>

            {/* Right Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <Tooltip title="Keranjang Belanja">
                <Badge count={cartCount} size="small" color="#0052cc">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<ShoppingCartOutlined style={{ fontSize: 19, color: '#ffffff' }} />}
                    onClick={() => router.push('/cart')}
                    style={{ width: 38, height: 38, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                </Badge>
              </Tooltip>

              {user ? (
                <>
                  <Tooltip title="Pesan / Live Chat">
                    <Badge count={unreadCount} size="small" color="#f59e0b">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<MessageOutlined style={{ fontSize: 19, color: '#00f2fe' }} />}
                        onClick={() => setDirectDrawerOpen(true)}
                        style={{ width: 38, height: 38, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </Badge>
                  </Tooltip>

                  <Tooltip title="Jual Barang" className="hide-mobile">
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => router.push('/sell')}
                      style={{
                        borderRadius: 99,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                        color: '#090d16',
                        border: 'none',
                        boxShadow: '0 4px 16px rgba(0, 242, 254, 0.35)',
                        padding: '0 16px',
                        height: 38
                      }}
                    >
                      Jual
                    </Button>
                  </Tooltip>

                  <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
                    <Avatar
                      style={{ backgroundColor: '#0052cc', cursor: 'pointer', border: '2px solid #00f2fe', boxShadow: '0 0 14px rgba(0,242,254,0.4)' }}
                      size={36}
                      icon={<UserOutlined />}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </Dropdown>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Button
                    type="text"
                    onClick={() => router.push('/login')}
                    style={{ borderRadius: 99, color: '#ffffff', fontWeight: 700, fontSize: 12, height: 36 }}
                  >
                    Masuk
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => router.push('/register')}
                    style={{
                      borderRadius: 99,
                      fontWeight: 800,
                      fontSize: 12,
                      height: 36,
                      background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                      color: '#090d16',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(0, 242, 254, 0.35)'
                    }}
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Dock Bar */}
      <div className="mobile-bottom-nav">
        <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <HomeOutlined />
          <span>Beranda</span>
        </Link>
        <Link href="/cart" className={`mobile-nav-item ${pathname === '/cart' ? 'active' : ''}`}>
          <Badge count={cartCount} size="small" offset={[4, 0]}>
            <ShoppingCartOutlined />
          </Badge>
          <span>Keranjang</span>
        </Link>
        <Link href="/sell" className={`mobile-nav-item ${pathname === '/sell' ? 'active' : ''}`}>
          <PlusCircleOutlined style={{ color: '#00f2fe' }} />
          <span>Jual</span>
        </Link>
        <div onClick={() => setDirectDrawerOpen(true)} className="mobile-nav-item" style={{ cursor: 'pointer' }}>
          <Badge count={unreadCount} size="small" offset={[4, 0]}>
            <MessageOutlined />
          </Badge>
          <span>Pesan</span>
        </div>
        <Link href="/profile" className={`mobile-nav-item ${pathname === '/profile' ? 'active' : ''}`}>
          <UserOutlined />
          <span>Profil</span>
        </Link>
      </div>

      <DirectChatDrawer open={directDrawerOpen} onClose={() => setDirectDrawerOpen(false)} />
    </>
  );
}
