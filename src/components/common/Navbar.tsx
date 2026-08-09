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
    // Auto-request browser/device notification permission if logged in
    if (user && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

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
      
      // 1. AntD In-App Toast
      notification.info({
        message: '🔔 Pesan / Orderan Baru Masuk!',
        description: 'Ada aktivitas percakapan baru di PresUMart.',
        placement: 'topRight',
        onClick: () => { setDirectDrawerOpen(true); },
        duration: 5,
      });

      // 2. Native System/OS Device PWA Notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification('🔔 PresUMart: Pesan / Orderan Baru Masuk!', {
                body: 'Ada pesan atau pesanan COD baru di aplikasi PresUMart.',
                icon: '/icon-192.svg',
                badge: '/icon-192.svg',
                tag: 'presumart-msg-' + Date.now(),
              });
            });
          } else {
            new Notification('🔔 PresUMart: Pesan / Orderan Baru Masuk!', {
              body: 'Ada pesan atau pesanan COD baru di aplikasi PresUMart.',
              icon: '/icon-192.svg',
              tag: 'presumart-msg-' + Date.now(),
            });
          }
        } catch (e) {
          // Fallback if browser blocks popups
        }
      }
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

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Profil Saya</Link>,
    },
    {
      key: 'sell',
      icon: <PlusCircleOutlined style={{ color: '#52c41a' }} />,
      label: <Link href="/sell">Jual Barang</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      label: 'Keluar',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      {/* 1. TOP UTILITY BAR (Campus Info Only - No Duplicate Links) */}
      <div 
        className="navbar-top-bar" 
        style={{ 
          backgroundColor: '#001a40', 
          color: '#cbd5e1', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '4px 16px', 
          fontSize: '11px',
          letterSpacing: '0.01em'
        }}
      >
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🎓</span>
          <span style={{ fontWeight: 600, color: '#00e5ff' }}>PresUMart</span>
          <span>• Marketplace Resmi Mahasiswa President University Jababeka</span>
        </div>
        <div style={{ flexShrink: 0 }} className="hide-mobile">
          {user ? (
            <span style={{ color: '#00e5ff', fontWeight: 600 }}>
              Halo, {user.name} ({user.major || 'Mahasiswa PresUniv'})
            </span>
          ) : (
            <span>📍 Area COD: Student Center • Rektorat • Asrama PU</span>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div 
        className="navbar-main"
        style={{ 
          backgroundColor: '#ffffff', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '10px 20px', 
          boxShadow: '0 4px 12px rgba(0, 26, 64, 0.08)',
          borderBottom: '1px solid #e6eeff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
          {/* LEFT: Iconic PresUMart Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              background: 'linear-gradient(135deg, #001a40 0%, #003399 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,51,153,0.3)'
            }}>
              <ShopOutlined style={{ fontSize: '20px', color: '#00e5ff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#001a40' }}>
                Pres<span style={{ color: '#003399' }}>U</span><span style={{ color: '#00b8d9' }}>Mart</span>
              </div>
              <span className="hide-mobile" style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                President University
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR */}
          <div className="hide-mobile" style={{ flex: 1, maxWidth: '600px', margin: '0 16px' }}>
            <Input.Search 
              placeholder="Cari barang, buku, gadget, jasa..." 
              onSearch={handleSearch}
              size="middle"
              style={{ borderRadius: 24, overflow: 'hidden' }}
              styles={{ input: { borderRadius: '24px 0 0 24px' } }}
              enterButton
            />
          </div>

          {/* RIGHT: Icon Buttons & Single Auth Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Tooltip title="Keranjang">
              <Badge count={cartCount} size="small" color="#003399">
                <Button 
                  type="text" 
                  icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#003399' }} />} 
                  onClick={() => router.push('/cart')} 
                />
              </Badge>
            </Tooltip>

            {user ? (
              <>
                <Tooltip title="Pesan">
                  <Badge count={unreadCount} size="small" color="#f59e0b">
                    <Button 
                      type="text" 
                      icon={<MessageOutlined style={{ fontSize: '20px', color: '#00b8d9' }} />} 
                      onClick={() => setDirectDrawerOpen(true)} 
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Jual Barang" className="hide-mobile">
                  <Button 
                    type="primary"
                    icon={<PlusCircleOutlined style={{ fontSize: '16px' }} />} 
                    onClick={() => router.push('/sell')}
                    style={{ background: 'linear-gradient(135deg, #00b8d9 0%, #008299 100%)', border: 'none', borderRadius: 20 }}
                  >
                    Jual
                  </Button>
                </Tooltip>
                <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
                  <Avatar style={{ backgroundColor: '#003399', cursor: 'pointer', border: '2px solid #00e5ff' }} size="medium" icon={<UserOutlined />} />
                </Dropdown>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button 
                  type="default" 
                  size="middle" 
                  onClick={() => router.push('/login')} 
                  style={{ borderRadius: 20, borderColor: '#003399', color: '#003399', fontWeight: 600 }}
                >
                  Masuk
                </Button>
                <Button 
                  type="primary" 
                  size="middle" 
                  onClick={() => router.push('/register')} 
                  style={{ borderRadius: 20, background: 'linear-gradient(135deg, #003399 0%, #001a40 100%)', border: 'none', fontWeight: 600, boxShadow: '0 4px 10px rgba(0,51,153,0.25)' }}
                >
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH BAR (SHOWS ON SMARTPHONES) */}
        <div className="show-mobile" style={{ width: '100%', marginTop: 8 }}>
          <Input.Search 
            placeholder="Cari barang, buku, gadget..." 
            onSearch={handleSearch}
            size="middle"
            style={{ borderRadius: 20, overflow: 'hidden' }}
            styles={{ input: { borderRadius: '20px 0 0 20px', fontSize: '13px' } }}
            enterButton
          />
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (PWA NATIVE STYLE) */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <HomeOutlined />
          <span>Beranda</span>
        </Link>
        <Link href="/sell" className={`mobile-nav-item ${pathname === '/sell' ? 'active' : ''}`}>
          <PlusCircleOutlined style={{ color: '#52c41a' }} />
          <span>Jual</span>
        </Link>
        <div 
          className="mobile-nav-item" 
          onClick={() => setDirectDrawerOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <Badge count={unreadCount} size="small" offset={[4, -2]}>
            <MessageOutlined style={{ color: '#3b82f6' }} />
          </Badge>
          <span>Chat</span>
        </div>
        <Link href="/cart" className={`mobile-nav-item ${pathname === '/cart' ? 'active' : ''}`}>
          <Badge count={cartCount} size="small" offset={[4, -2]}>
            <ShoppingCartOutlined style={{ color: '#10b981' }} />
          </Badge>
          <span>Keranjang</span>
        </Link>
        <Link href={user ? '/profile' : '/login'} className={`mobile-nav-item ${pathname === '/profile' || pathname === '/login' ? 'active' : ''}`}>
          <UserOutlined />
          <span>{user ? 'Akun' : 'Masuk'}</span>
        </Link>
      </nav>

      <DirectChatDrawer 
        open={directDrawerOpen}
        onClose={() => setDirectDrawerOpen(false)}
      />
    </header>
  );
}
