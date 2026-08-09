'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Modal, Typography, Space } from 'antd';
import { DownloadOutlined, CloseOutlined, ShareAltOutlined, PlusSquareOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed PWA standalone app
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Android & Chrome Desktop PWA Install Event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (iosDevice && !inStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosModal(true);
    } else {
      // Fallback hint
      setShowIosModal(true);
    }
  }

  if (isStandalone || !showBanner) return null;

  return (
    <>
      <div
        className="pwa-install-prompt"
        style={{
          position: 'fixed',
          bottom: 76,
          left: 16,
          right: 16,
          maxWidth: 420,
          margin: '0 auto',
          zIndex: 9990,
        }}
      >
        <Card
          size="small"
          style={{
            borderRadius: 14,
            background: 'linear-gradient(135deg, #001a40 0%, #003399 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 26, 64, 0.3)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '4px 8px'
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00b8d9 0%, #008299 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  flexShrink: 0
                }}
              >
                P
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <Text strong style={{ color: '#ffffff', fontSize: 13, display: 'block' }}>
                  Install Aplikasi PresUMart
                </Text>
                <Text style={{ color: '#00e5ff', fontSize: 10, fontWeight: 500 }}>
                  Akses Cepat Android & iPhone
                </Text>
              </div>
            </div>

            <Space size={6} align="center">
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined style={{ fontSize: 12 }} />}
                style={{ background: 'linear-gradient(135deg, #00b8d9 0%, #008299 100%)', border: 'none', fontWeight: 700, borderRadius: 16, height: 30, fontSize: 12, padding: '0 14px', boxShadow: '0 2px 6px rgba(0,184,217,0.4)' }}
                onClick={handleInstallClick}
              >
                Install
              </Button>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<CloseOutlined style={{ color: '#ffffff', fontSize: 13 }} />}
                onClick={() => setShowBanner(false)}
                title="Tutup Banner"
                style={{ width: 28, height: 28, background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Space>
          </div>
        </Card>
      </div>

      {/* Modal Petunjuk Install iOS Safari & Android */}
      <Modal
        title="📲 Cara Download PresUMart di HP (Android & iPhone)"
        open={showIosModal}
        onCancel={() => setShowIosModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowIosModal(false)}>
            Mengerti
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <Paragraph style={{ fontSize: 13, marginBottom: 16 }}>
            PresUMart adalah aplikasi web modern (PWA) yang bisa diinstal di Android & iPhone tanpa App Store / Play Store:
          </Paragraph>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
            <Text strong style={{ color: '#0052cc', display: 'block', marginBottom: 6 }}>🍎 Pengguna iPhone / iPad (iOS Safari):</Text>
            <ol style={{ paddingLeft: 20, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Tekan ikon <b>Bagikan (Share)</b> <ShareAltOutlined style={{ color: '#0052cc' }} /> di bagian bawah browser Safari.</li>
              <li>Pilih menu <b>&quot;Tambahkan ke Layar Utama&quot;</b> (*Add to Home Screen*) <PlusSquareOutlined style={{ color: '#36b37e' }} />.</li>
              <li>Tekan <b>&quot;Tambah&quot;</b> di pojok kanan atas.</li>
            </ol>
          </div>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Text strong style={{ color: '#36b37e', display: 'block', marginBottom: 6 }}>🤖 Pengguna Android (Chrome):</Text>
            <ol style={{ paddingLeft: 20, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Tekan titik 3 di kanan atas Chrome.</li>
              <li>Pilih <b>&quot;Install Aplikasi&quot;</b> atau <b>&quot;Tambahkan ke Layar Utama&quot;</b>.</li>
            </ol>
          </div>
        </div>
      </Modal>
    </>
  );
}
