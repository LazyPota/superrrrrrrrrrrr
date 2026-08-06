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
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          maxWidth: 460,
          margin: '0 auto',
          zIndex: 9999,
        }}
      >
        <Card
          size="small"
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0052cc 0%, #0f172a 100%)',
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(0, 82, 204, 0.35)',
            border: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 22,
                  color: '#0052cc',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                P
              </div>
              <div>
                <Text strong style={{ color: '#ffffff', fontSize: 14, display: 'block' }}>
                  Install Aplikasi PresUMart
                </Text>
                <Text style={{ color: '#cbd5e1', fontSize: 11 }}>
                  Akses Cepat di Android & iOS • COD Kampus
                </Text>
              </div>
            </div>

            <Space size={6}>
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                style={{ background: '#36b37e', borderColor: '#36b37e', fontWeight: 600, borderRadius: 8, height: 32 }}
                onClick={handleInstallClick}
              >
                Download
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: '#ffffff', fontSize: 14 }} />}
                onClick={() => setShowBanner(false)}
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
