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
      const unread = msgs.filter(
        m => (m.sellerEmail === u.email && m.unreadBySeller) || (m.buyerEmail === u.email && m.unreadByBuyer)
      ).length;
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
      {/* 1. TOP UTILITY BAR */}
      <div 
        className="navbar-top-bar" 
        style={{ 
          backgroundColor: '#0f172a', 
          color: '#e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '4px 16px', 
          fontSize: '11px' 
        }}
      >
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          🎓 PresUMart • Kampus President University
        </div>
        <div style={{ flexShrink: 0 }}>
          {user ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span>Halo, {user.name.split(' ')[0]}</span>
              <span>|</span>
              <span 
                onClick={handleLogout} 
                style={{ cursor: 'pointer', color: '#e2e8f0', textDecoration: 'underline' }}
              >
                Keluar
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link href="/login" style={{ color: '#e2e8f0' }}>Masuk</Link>
              <span>|</span>
              <Link href="/register" style={{ color: '#e2e8f0' }}>Daftar</Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div 
        className="navbar-main"
        style={{ 
          backgroundColor: 'white', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '10px 16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
          {/* LEFT: Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', fontWeight: 'bold', color: '#1677ff', textDecoration: 'none', flexShrink: 0 }}>
            <ShopOutlined style={{ fontSize: '22px' }} />
            <span>PresUMart</span>
          </Link>

          {/* DESKTOP SEARCH BAR */}
          <div className="hide-mobile" style={{ flex: 1, maxWidth: '600px', margin: '0 16px' }}>
            <Input.Search 
              placeholder="Cari barang, buku, gadget..." 
              onSearch={handleSearch}
              size="middle"
              style={{ borderRadius: 24, overflow: 'hidden' }}
              styles={{ input: { borderRadius: '24px 0 0 24px' } }}
              enterButton
            />
          </div>

          {/* RIGHT: Icon Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {user ? (
              <>
                <Tooltip title="Pesan">
                  <Badge count={unreadCount} size="small">
                    <Button 
                      type="text" 
                      icon={<MessageOutlined style={{ fontSize: '18px' }} />} 
                      onClick={() => setDirectDrawerOpen(true)} 
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Keranjang">
                  <Badge count={cartCount} size="small">
                    <Button 
                      type="text" 
                      icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} 
                      onClick={() => router.push('/cart')} 
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Jual Barang" className="hide-mobile">
                  <Button 
                    type="text" 
                    icon={<PlusCircleOutlined style={{ fontSize: '18px', color: '#52c41a' }} />} 
                    onClick={() => router.push('/sell')} 
                  />
                </Tooltip>
                <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
                  <Avatar style={{ backgroundColor: '#1677ff', cursor: 'pointer' }} size="small" icon={<UserOutlined />} />
                </Dropdown>
              </>
            ) : (
              <>
                <Tooltip title="Keranjang">
                  <Badge count={cartCount} size="small">
                    <Button 
                      type="text" 
                      icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} 
                      onClick={() => router.push('/cart')} 
                    />
                  </Badge>
                </Tooltip>
                <Button type="primary" size="small" onClick={() => router.push('/login')} shape="round">
                  Masuk
                </Button>
              </>
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
