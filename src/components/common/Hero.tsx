'use client';

import { Typography, Card, Tag, Button, Row, Col, Space, Input } from 'antd';
import { 
  SafetyCertificateOutlined, 
  RocketOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  CodeOutlined, 
  CheckCircleOutlined,
  DownloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function Hero() {
  function handleInstallApp() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
    }
  }

  return (
    <div 
      className="hero-container animate-fade-in"
      style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #0b192c 0%, #003399 50%, #06b6d4 100%)',
        backgroundSize: '250% 250%',
        color: '#fff', 
        padding: '72px 24px', 
        borderRadius: '0 0 36px 36px', 
        marginBottom: 40,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(11,25,44,0.35)'
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatSlow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .hero-container {
          animation: gradientBG 12s ease infinite;
        }
        .hero-glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-glass-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.25);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(6, 182, 212, 0.4);
        }
        .hero-grid-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          z-index: 1;
          pointer-events: none;
        }
        .hero-orb-1 {
          position: absolute;
          top: -100px;
          right: 8%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(6,182,212,0) 70%);
          filter: blur(40px);
          animation: floatSlow 8s ease-in-out infinite;
          z-index: 0;
        }
        .hero-orb-2 {
          position: absolute;
          bottom: -150px;
          left: 5%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,82,204,0.4) 0%, rgba(0,82,204,0) 70%);
          filter: blur(50px);
          z-index: 0;
        }
      `}</style>

      {/* Background ambient pattern & glowing orbs */}
      <div className="hero-grid-pattern" />
      <div className="hero-orb-1" />
      <div className="hero-orb-2" />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} md={12} lg={13} className="animate-slide-up">
            <Tag 
              color="cyan" 
              icon={<SafetyCertificateOutlined style={{ color: '#00f2fe' }} />} 
              style={{ 
                marginBottom: 16, 
                padding: '6px 16px', 
                borderRadius: 30, 
                fontSize: 13,
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#ecfeff',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.02em'
              }}
            >
              Marketplace Resmi Mahasiswa President University
            </Tag>
            
            <Title 
              level={1} 
              className="hero-title"
              style={{ 
                color: '#ffffff', 
                fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', 
                fontWeight: 800, 
                lineHeight: 1.18, 
                marginBottom: 18,
                letterSpacing: '-0.02em'
              }}
            >
              Jual & Beli Barang Kampus <br className="hide-mobile" />
              <span style={{ 
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                Cepat, Aman & Tanpa Admin
              </span>
            </Title>
            
            <Paragraph 
              className="hero-subtitle"
              style={{ 
                color: 'rgba(241, 245, 249, 0.9)', 
                fontSize: '1.05rem', 
                marginBottom: 28, 
                maxWidth: 540,
                lineHeight: 1.6
              }}
            >
              Platform COD khusus mahasiswa Jababeka. Cari buku kuliah, barang kost, gadget, hingga voucher dengan transaksi langsung saat ketemuan di kampus!
            </Paragraph>

            <Space wrap size="middle" style={{ marginBottom: 12 }}>
              <Link href="/sell">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShopOutlined />} 
                  style={{ 
                    height: 50, 
                    padding: '0 28px', 
                    fontSize: 15, 
                    fontWeight: 700, 
                    borderRadius: 25,
                    background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0, 242, 254, 0.35)'
                  }}
                >
                  Mulai Jualan Gratis
                </Button>
              </Link>

              <Button 
                size="large" 
                icon={<DownloadOutlined />} 
                onClick={handleInstallApp}
                style={{ 
                  height: 50, 
                  padding: '0 24px', 
                  fontSize: 15, 
                  fontWeight: 600, 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)', 
                  color: '#ffffff',
                  borderRadius: 25,
                }}
              >
                Download Aplikasi
              </Button>
            </Space>
          </Col>
          
          <Col xs={24} md={12} lg={11} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card className="hero-glass-card" variant="borderless" styles={{ body: { padding: '20px 24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UsergroupAddOutlined style={{ fontSize: 26, color: '#00f2fe' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 18 }}>100+ Mahasiswa Terverifikasi</Title>
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'block', marginTop: 2 }}>Akun khusus domain email @president.ac.id</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card className="hero-glass-card" variant="borderless" styles={{ body: { padding: '20px 24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ThunderboltOutlined style={{ fontSize: 26, color: '#fcb900' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 18 }}>COD Langsung di Kampus</Title>
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'block', marginTop: 2 }}>Ketemuan aman di Student Center, Dormitory, atau Library</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card className="hero-glass-card" variant="borderless" styles={{ body: { padding: '20px 24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarOutlined style={{ fontSize: 26, color: '#34d399' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 18 }}>0% Biaya Layanan / Admin</Title>
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'block', marginTop: 2 }}>Hasil penjualan 100% utuh milik mahasiswa</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
