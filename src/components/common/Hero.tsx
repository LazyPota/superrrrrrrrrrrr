'use client';

import { Typography, Card, Tag, Button, Row, Col, Space } from 'antd';
import { 
  SafetyCertificateOutlined, 
  ShopOutlined, 
  ThunderboltOutlined, 
  DownloadOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  RocketOutlined,
  FireOutlined
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
        background: '#090d16',
        color: '#fff', 
        padding: '60px 20px 48px 20px', 
        borderRadius: '0 0 36px 36px', 
        marginBottom: 40,
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)'
      }}
    >
      <style>{`
        .cyber-orb-1 {
          position: absolute;
          top: -120px;
          right: 5%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, rgba(0, 82, 204, 0.05) 60%, transparent 80%);
          filter: blur(60px);
          pointer-events: none;
        }
        .cyber-orb-2 {
          position: absolute;
          bottom: -150px;
          left: 0%;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 82, 204, 0.3) 0%, rgba(0, 242, 254, 0.05) 60%, transparent 80%);
          filter: blur(60px);
          pointer-events: none;
        }
      `}</style>

      {/* Cyber Orbs */}
      <div className="cyber-orb-1" />
      <div className="cyber-orb-2" />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Row gutter={[32, 32]} align="middle">
          {/* Main Hero Copy */}
          <Col xs={24} lg={13} className="animate-slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', marginBottom: 20 }}>
              <FireOutlined style={{ color: '#00f2fe' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Platform Jual Beli Resmi President University
              </span>
            </div>

            <Title 
              level={1} 
              style={{ 
                color: '#ffffff', 
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                marginBottom: 20,
                fontFamily: 'Syne, sans-serif'
              }}
            >
              Pasar Kampus <br />
              <span className="glow-text-cyan">Tanpa Potongan Admin</span>
            </Title>

            <Paragraph 
              style={{ 
                color: '#94a3b8', 
                fontSize: '1.05rem', 
                marginBottom: 32, 
                maxWidth: 520,
                lineHeight: 1.6
              }}
            >
              Jual beli barang kuliah, perlengkapan kost, gadget & jasa antar sesama mahasiswa President University. COD langsung aman di area kampus Jababeka!
            </Paragraph>

            <Space wrap size="middle">
              <Link href="/sell">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShopOutlined />} 
                  style={{ 
                    height: 52, 
                    padding: '0 32px', 
                    fontSize: 16, 
                    fontWeight: 800, 
                    borderRadius: 99,
                    background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                    color: '#090d16',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0, 242, 254, 0.35)'
                  }}
                >
                  Pasang Iklan Jualan
                </Button>
              </Link>

              <Button 
                size="large" 
                icon={<DownloadOutlined />} 
                onClick={handleInstallApp}
                style={{ 
                  height: 52, 
                  padding: '0 24px', 
                  fontSize: 15, 
                  fontWeight: 700, 
                  background: 'rgba(255, 255, 255, 0.06)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: '#ffffff',
                  borderRadius: 99,
                }}
              >
                Download App
              </Button>
            </Space>
          </Col>

          {/* Right Bento Widgets */}
          <Col xs={24} lg={11} className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="bento-card bento-dark" style={{ padding: '24px' }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                        <UsergroupAddOutlined style={{ fontSize: 28, color: '#00f2fe' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: 18 }}>100% Komunitas Kampus</Title>
                      <Text style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginTop: 2 }}>Terverifikasi email resmi @student.president.ac.id</Text>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col span={12}>
                <div className="bento-card bento-dark" style={{ padding: '20px' }}>
                  <ThunderboltOutlined style={{ fontSize: 28, color: '#f59e0b', marginBottom: 10 }} />
                  <Title level={5} style={{ color: '#fff', margin: '0 0 4px 0', fontWeight: 800 }}>COD Bebas Ongkir</Title>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Ketemuan di Student Center atau Dormitory</Text>
                </div>
              </Col>

              <Col span={12}>
                <div className="bento-card bento-dark" style={{ padding: '20px' }}>
                  <DollarOutlined style={{ fontSize: 28, color: '#10b981', marginBottom: 10 }} />
                  <Title level={5} style={{ color: '#fff', margin: '0 0 4px 0', fontWeight: 800 }}>0% Potongan</Title>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Hasil jualan 100% milik mahasiswamu</Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
