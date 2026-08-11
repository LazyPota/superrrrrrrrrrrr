'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Input, Badge, Button, Dropdown, Avatar, Tooltip, notification, Space } from 'antd';
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
  SettingOutlined,
  HeartOutlined
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
      
      notification.info({
        message: '🔔 Pesan / Orderan Baru Masuk!',
        description: 'Ada aktivitas percakapan baru di PresUMart.',
        placement: 'topRight',
        onClick: () => { setDirectDrawerOpen(true); },
        duration: 5,
      });

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
        } catch (e) {}
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
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <UserOutlined style={{ color: '#0052cc' }} />
          <span>Profil Saya</span>
        </Link>
      ),
    },
    {
      key: 'orders',
      label: (
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <HistoryOutlined style={{ color: '#06b6d4' }} />
          <span>Riwayat Pesanan</span>
        </Link>
      ),
    },
    {
      key: 'sell',
      label: (
        <Link href="/sell" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <ShopOutlined style={{ color: '#10b981' }} />
          <span>Kelola Barang Jualan</span>
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }}>
          <LogoutOutlined />
          <span>Keluar Akun</span>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Top Banner Bar */}
      <div className="navbar-top-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: 1240, width: '100%', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#00f2fe', fontWeight: 700, fontSize: 11 }}>● LIVE</span>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>PresUMart Campus COD Marketplace • Cikarang Jababeka</span>
          </div>
          <div className="hide-mobile" style={{ fontSize: 12, color: '#94a3b8' }}>
            <span>Verified President University Community</span>
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <nav 
        className="glass-nav"
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          padding: '10px 20px',
          boxShadow: '0 4px 20px rgba(0, 51, 153, 0.05)'
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #0b192c 0%, #0052cc 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,82,204,0.35)',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}>
              <ShopOutlined style={{ fontSize: 22, color: '#00f2fe' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#0b192c', fontFamily: 'Outfit' }}>
                Pres<span style={{ color: '#0052cc' }}>U</span><span style={{ color: '#06b6d4' }}>Mart</span>
              </div>
              <span className="hide-mobile" style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                President University
              </span>
            </div>
          </Link>

          {/* Desktop Search Pill Bar */}
          <div className="hide-mobile" style={{ flex: 1, maxWidth: 560, margin: '0 16px' }}>
            <Input.Search 
              placeholder="Cari buku kuliah, barang kost, gadget, jasa..." 
              onSearch={handleSearch}
              size="middle"
              style={{ borderRadius: 24, overflow: 'hidden' }}
              enterButton
            />
          </div>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Tooltip title="Keranjang Belanja">
              <Badge count={cartCount} size="small" color="#0052cc">
                <Button 
                  type="text" 
                  shape="circle"
                  icon={<ShoppingCartOutlined style={{ fontSize: 20, color: '#0b192c' }} />} 
                  onClick={() => router.push('/cart')} 
                  style={{ width: 40, height: 40 }}
                />
              </Badge>
            </Tooltip>

            {user ? (
              <>
                <Tooltip title="Pesan / Chat Direct">
                  <Badge count={unreadCount} size="small" color="#f59e0b">
                    <Button 
                      type="text" 
                      shape="circle"
                      icon={<MessageOutlined style={{ fontSize: 20, color: '#06b6d4' }} />} 
                      onClick={() => setDirectDrawerOpen(true)} 
                      style={{ width: 40, height: 40 }}
                    />
                  </Badge>
                </Tooltip>

                <Tooltip title="Jual Barang Baru" className="hide-mobile">
                  <Button 
                    type="primary"
                    icon={<PlusCircleOutlined style={{ fontSize: 16 }} />} 
                    onClick={() => router.push('/sell')}
                    className="btn-gradient-primary"
                    style={{ borderRadius: 20, fontWeight: 700, padding: '0 18px' }}
                  >
                    Jual Barang
                  </Button>
                </Tooltip>

                <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
                  <Avatar 
                    style={{ backgroundColor: '#0052cc', cursor: 'pointer', border: '2px solid #00f2fe', boxShadow: '0 2px 8px rgba(0,82,204,0.3)' }} 
                    size={38} 
                    icon={<UserOutlined />} 
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </Dropdown>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <Button 
                  type="default" 
                  onClick={() => router.push('/login')} 
                  style={{ borderRadius: 20, borderColor: '#0052cc', color: '#0052cc', fontWeight: 700, fontSize: 13, height: 36 }}
                >
                  Masuk
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => router.push('/register')} 
                  className="btn-gradient-primary"
                  style={{ borderRadius: 20, fontWeight: 700, fontSize: 13, height: 36 }}
                >
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="show-mobile" style={{ marginTop: 8 }}>
          <Input.Search 
            placeholder="Cari produk / jasa..." 
            onSearch={handleSearch}
            size="middle"
            style={{ width: '100%' }}
          />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <HomeOutlined />
          <span>Beranda</span>
        </Link>
        <Link href="/cart" className={`mobile-nav-item ${pathname === '/cart' ? 'active' : ''}`}>
          <Badge count={cartCount} size="small" offset={[6, 0]}>
            <ShoppingCartOutlined />
          </Badge>
          <span>Keranjang</span>
        </Link>
        <Link href="/sell" className={`mobile-nav-item ${pathname === '/sell' ? 'active' : ''}`}>
          <PlusCircleOutlined style={{ color: '#0052cc' }} />
          <span>Jual</span>
        </Link>
        <div onClick={() => setDirectDrawerOpen(true)} className="mobile-nav-item" style={{ cursor: 'pointer' }}>
          <Badge count={unreadCount} size="small" offset={[6, 0]}>
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
