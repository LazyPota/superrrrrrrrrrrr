'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Modal, Typography, Space } from 'antd';
import { DownloadOutlined, CloseOutlined, ShareAltOutlined, PlusSquareOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const PWA_SESSION_KEY = 'presumart_pwa_banner_shown_v1';
const PWA_DISMISSED_KEY = 'presumart_pwa_banner_dismissed_v1';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check standalone mode (already installed app)
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if user previously closed banner OR banner was already shown once in this session
    const isDismissed = localStorage.getItem(PWA_DISMISSED_KEY) === 'true';
    const isSessionShown = sessionStorage.getItem(PWA_SESSION_KEY) === 'true';

    // Only show banner if NOT dismissed and NOT already shown in this session
    const shouldShow = !isDismissed && !isSessionShown;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (shouldShow) {
        setShowBanner(true);
        sessionStorage.setItem(PWA_SESSION_KEY, 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowIosModal(true);
      }
    };

    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    if (iosDevice && !inStandalone && shouldShow) {
      setShowBanner(true);
      sessionStorage.setItem(PWA_SESSION_KEY, 'true');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, []);

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem(PWA_DISMISSED_KEY, 'true');
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
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
        <div 
          className="neo-card neo-card-yellow"
          style={{
            padding: '12px 16px',
            color: '#000000',
            boxShadow: '4px 4px 0px #000000',
            border: '3px solid #000000',
            borderRadius: 14
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ color: '#000000', fontSize: 13, display: 'block', fontWeight: 900 }}>
                📲 Install Aplikasi PresUMart
              </Text>
              <Text style={{ color: '#000000', fontSize: 11, fontWeight: 700, display: 'block' }}>
                Akses cepat Android & iPhone tanpa lewat browser
              </Text>
            </div>

            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleInstallClick}
                style={{
                  background: '#00f0ff',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: 12,
                  borderRadius: 8,
                }}
              >
                Install
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: '#000000' }} />}
                onClick={handleDismiss}
              />
            </Space>
          </div>
        </div>
      </div>

      <Modal
        title="📱 Cara Install Aplikasi PresUMart"
        open={showIosModal}
        onCancel={() => setShowIosModal(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setShowIosModal(false)}
            style={{ background: '#ffe600', border: '2px solid #000', boxShadow: '2px 2px 0px #000', fontWeight: 900, borderRadius: 8 }}
          >
            Mengerti!
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          {isIOS ? (
            <div>
              <Paragraph style={{ fontWeight: 700 }}>
                Untuk menginstall PresUMart di <b>iPhone / iPad (Safari)</b>:
              </Paragraph>
              <ol style={{ paddingLeft: 20, lineHeight: 1.8, fontWeight: 600 }}>
                <li>
                  Buka website di Safari lalu tekan tombol <b>Bagikan / Share</b> (<ShareAltOutlined style={{ color: '#0052cc' }} />).
                </li>
                <li>
                  Gulir ke bawah dan pilih <b>&quot;Tambah ke Layar Utama&quot;</b> / <b>&quot;Add to Home Screen&quot;</b> (<PlusSquareOutlined style={{ color: '#0052cc' }} />).
                </li>
                <li>Tekan <b>Tambah</b> di pojok kanan atas.</li>
              </ol>
            </div>
          ) : (
            <div>
              <Paragraph style={{ fontWeight: 700 }}>
                Untuk menginstall PresUMart di <b>Android / Chrome</b>:
              </Paragraph>
              <ol style={{ paddingLeft: 20, lineHeight: 1.8, fontWeight: 600 }}>
                <li>Tekan tombol menu titik tiga (<b>⋮</b>) di pojok kanan atas browser.</li>
                <li>Pilih <b>&quot;Install Aplikasi&quot;</b> atau <b>&quot;Tambahkan ke Layar Utama&quot;</b>.</li>
                <li>Ikuti petunjuk di layar untuk memasang ikon aplikasi PresUMart di HP kamu.</li>
              </ol>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
