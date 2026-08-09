'use client';

import { Typography, Card, Tag, Button, Row, Col, Space } from 'antd';
import { 
  SafetyCertificateOutlined, 
  RocketOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  CodeOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Hero() {
  return (
    <div 
      className="hero-container animate-fade-in"
      style={{ 
        position: 'relative',
        background: 'linear-gradient(-45deg, #001529, #002b66, #0052cc, #0747a6)',
        backgroundSize: '400% 400%',
        color: '#fff', 
        padding: '80px 24px', 
        borderRadius: '0 0 40px 40px', 
        marginBottom: 48,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,43,102,0.2)'
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float1 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(20px) translateX(-20px) scale(1.1); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        .hero-container {
          animation: gradientBG 15s ease infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          background: rgba(255, 255, 255, 0.1);
        }
        .bg-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          z-index: 1;
          pointer-events: none;
        }
        .orb-1 {
          position: absolute;
          top: -100px;
          right: 10%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,184,217,0.3) 0%, rgba(0,184,217,0) 70%);
          filter: blur(40px);
          animation: float1 8s ease-in-out infinite;
          z-index: 0;
        }
        .orb-2 {
          position: absolute;
          bottom: -150px;
          left: 5%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,82,204,0.4) 0%, rgba(0,82,204,0) 70%);
          filter: blur(50px);
          animation: float2 12s ease-in-out infinite;
          z-index: 0;
        }
        .orb-3 {
          position: absolute;
          top: 30%;
          left: 45%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(54,179,126,0.2) 0%, rgba(54,179,126,0) 70%);
          filter: blur(30px);
          animation: float1 10s ease-in-out infinite reverse;
          z-index: 0;
        }
        .content-wrapper {
          position: relative;
          z-index: 2;
        }
        .gradient-text {
          background: linear-gradient(to right, #ffffff, #e6f0ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      
      <div className="bg-grid" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="orb-3" />

      <div className="content-wrapper" style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12} lg={13} className="animate-slide-up">
            <Space wrap style={{ marginBottom: 24 }}>
              <Tag color="cyan" icon={<SafetyCertificateOutlined />} style={{ fontSize: 13, padding: '6px 16px', borderRadius: 24, border: 'none', background: 'rgba(0, 184, 217, 0.2)', color: '#00e5ff' }}>
                Marketplace Resmi Mahasiswa PresUniv
              </Tag>
              <Tag color="blue" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '6px 16px', borderRadius: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                Khusus Komunitas Kampus Jababeka
              </Tag>
            </Space>
            
            <Title level={1} className="gradient-text hero-title" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', fontWeight: 800, margin: '16px 0 24px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Jual & Beli Barang Kampus Dengan Aman & Cepat
            </Title>
            
            <Paragraph className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)', marginBottom: 32, lineHeight: 1.6, maxWidth: 600 }}>
              Temukan buku perkuliahan, perlengkapan kos, barang elektronik, hingga jasa antar mahasiswa President University Jababeka.
            </Paragraph>
            
            <Space size="middle" wrap style={{ width: '100%', marginBottom: 16 }}>
              <Link href="/sell" style={{ display: 'inline-block' }}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<RocketOutlined />} 
                  style={{ 
                    background: 'linear-gradient(135deg, #00b8d9 0%, #008299 100%)', 
                    border: 'none', 
                    height: 48, 
                    padding: '0 24px', 
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: 24,
                    boxShadow: '0 8px 20px rgba(0,184,217,0.3)'
                  }}
                >
                  Mulai Jualan
                </Button>
              </Link>
              <a href="#produk" style={{ display: 'inline-block' }}>
                <Button 
                  ghost 
                  size="large" 
                  icon={<ShopOutlined />} 
                  style={{ 
                    height: 48, 
                    padding: '0 24px', 
                    fontSize: 15, 
                    fontWeight: 600,
                    borderColor: 'rgba(255,255,255,0.5)', 
                    color: '#fff',
                    borderRadius: 24
                  }}
                >
                  Jelajahi Produk
                </Button>
              </a>
            </Space>
          </Col>
          
          <Col xs={24} md={12} lg={11} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card className="glass-card" bordered={false} styles={{ body: { padding: '24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(54, 179, 126, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TeamOutlined style={{ fontSize: 28, color: '#57d9a3' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>100+ Mahasiswa</Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 14 }}>Penjual terverifikasi email @president.ac.id</Paragraph>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card className="glass-card" bordered={false} styles={{ body: { padding: '24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255, 171, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CodeOutlined style={{ fontSize: 28, color: '#ffc400' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Transaksi COD</Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 14 }}>Bayar langsung tunai saat ketemuan di kampus</Paragraph>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card className="glass-card" bordered={false} styles={{ body: { padding: '24px' } }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0, 184, 217, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SafetyCertificateOutlined style={{ fontSize: 28, color: '#00e5ff' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>100% Aman</Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 14 }}>Keamanan data dan transaksi terjamin</Paragraph>
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
