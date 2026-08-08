'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Badge, Button, Dropdown, Avatar, Tooltip, notification } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  ShopOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { getUser, getCart, removeUser, getDirectMessages, syncWithServer, speakVoice, playOrderSound } from '../../lib/store';
import DirectChatDrawer from '../chat/DirectChatDrawer';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [directDrawerOpen, setDirectDrawerOpen] = useState(false);
  const router = useRouter();

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
          padding: '4px 24px', 
          fontSize: '12px' 
        }}
      >
        <div>🎓 Marketplace Mahasiswa President University</div>
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Halo, {user.name}</span>
              <span>|</span>
              <span 
                onClick={handleLogout} 
                style={{ cursor: 'pointer', color: '#e2e8f0', textDecoration: 'underline' }}
              >
                Keluar
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
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
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '12px 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
        }}
      >
        {/* LEFT: Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold', color: '#1677ff', textDecoration: 'none' }}>
          <ShopOutlined style={{ fontSize: '24px' }} />
          <span>PresUMart</span>
        </Link>

        {/* CENTER: Search Bar */}
        <div style={{ flex: 1, maxWidth: '600px', margin: '0 32px' }}>
          <Input.Search 
            placeholder="Cari barang, buku, gadget..." 
            onSearch={handleSearch}
            size="large"
            style={{ borderRadius: 24, overflow: 'hidden' }}
            styles={{ input: { borderRadius: '24px 0 0 24px' } }}
            enterButton
          />
        </div>

        {/* RIGHT: Icon Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <Tooltip title="Pesan">
                <Badge count={unreadCount} size="small">
                  <Button 
                    type="text" 
                    icon={<MessageOutlined style={{ fontSize: '20px' }} />} 
                    onClick={() => setDirectDrawerOpen(true)} 
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="Keranjang">
                <Badge count={cartCount} size="small">
                  <Button 
                    type="text" 
                    icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />} 
                    onClick={() => router.push('/cart')} 
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="Jual Barang">
                <Button 
                  type="text" 
                  icon={<PlusCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />} 
                  onClick={() => router.push('/sell')} 
                />
              </Tooltip>
              <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
                <Avatar style={{ backgroundColor: '#1677ff', cursor: 'pointer' }} icon={<UserOutlined />} />
              </Dropdown>
            </>
          ) : (
            <>
              <Tooltip title="Keranjang">
                <Badge count={cartCount} size="small">
                  <Button 
                    type="text" 
                    icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />} 
                    onClick={() => router.push('/cart')} 
                  />
                </Badge>
              </Tooltip>
              <Button type="primary" onClick={() => router.push('/login')} shape="round">
                Masuk
              </Button>
            </>
          )}
        </div>
      </div>

      <DirectChatDrawer 
        open={directDrawerOpen}
        onClose={() => setDirectDrawerOpen(false)}
      />
    </header>
  );
}
