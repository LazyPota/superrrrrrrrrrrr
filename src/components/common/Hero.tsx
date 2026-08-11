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
  FireOutlined,
  SmileOutlined,
  StarFilled
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
      style={{ 
        background: '#ffe600',
        borderBottom: '4px solid #000000', 
        padding: '48px 20px 48px 20px', 
        marginBottom: 36,
        boxShadow: '0 8px 0px #000000'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]} align="middle">
          {/* Left Neobrutalist Content */}
          <Col xs={24} lg={13}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 99,
              background: '#ffffff',
              border: '3px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              marginBottom: 18
            }}>
              <FireOutlined style={{ color: '#ff2a85', fontSize: 16 }} />
              <span style={{ fontSize: 12, fontWeight: 900, color: '#000000', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                MARKETPLACE RESMI PRESIDENT UNIVERSITY!
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                color: '#000000', 
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', 
                fontWeight: 900, 
                lineHeight: 1.3,
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '-0.03em'
              }}>
                JUAL BELI KAMPUS
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ 
                  background: '#ff2a85', 
                  color: '#ffffff', 
                  padding: '6px 16px', 
                  borderRadius: 12,
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px #000000',
                  display: 'inline-block',
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 900,
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  100% BEBAS ADMIN!
                </span>
              </div>
            </div>

            <Paragraph 
              style={{ 
                color: '#000000', 
                fontSize: '1.05rem', 
                fontWeight: 700,
                marginBottom: 28, 
                maxWidth: 540,
                lineHeight: 1.6
              }}
            >
              Tempat jual beli buku kuliah, perlengkapan kost, gadget & jasa antar mahasiswa President University Jababeka. COD langsung aman di Student Center!
            </Paragraph>

            <Space wrap size="middle">
              <Link href="/sell">
                <Button 
                  style={{ 
                    height: 50, 
                    padding: '0 28px', 
                    fontSize: 15, 
                    fontWeight: 900, 
                    borderRadius: 14,
                    background: '#00f0ff',
                    color: '#000000',
                    border: '3px solid #000000',
                    boxShadow: '4px 4px 0px #000000'
                  }}
                  icon={<ShopOutlined />}
                >
                  PASANG IKLAN JUALAN!
                </Button>
              </Link>

              <Button 
                onClick={handleInstallApp}
                style={{ 
                  height: 50, 
                  padding: '0 20px', 
                  fontSize: 14, 
                  fontWeight: 900, 
                  background: '#ffffff', 
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px #000000', 
                  color: '#000000',
                  borderRadius: 14,
                }}
                icon={<DownloadOutlined />}
              >
                DOWNLOAD APP
              </Button>
            </Space>
          </Col>

          {/* Right Neobrutalist Cards */}
          <Col xs={24} lg={11}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{
                  background: '#ffffff',
                  border: '3px solid #000000',
                  boxShadow: '5px 5px 0px #000000',
                  borderRadius: 16,
                  padding: '20px'
                }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: '#00e676',
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px #000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <UsergroupAddOutlined style={{ fontSize: 24, color: '#000000' }} />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ margin: 0, fontWeight: 900, fontSize: 17, color: '#000000' }}>100% Mahasiswa PresUniv</Title>
                      <Text style={{ fontWeight: 700, color: '#000000', fontSize: 12, display: 'block', marginTop: 2 }}>Terverifikasi email @student.president.ac.id</Text>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col span={12}>
                <div style={{
                  background: '#00f0ff',
                  border: '3px solid #000000',
                  boxShadow: '5px 5px 0px #000000',
                  borderRadius: 16,
                  padding: '16px'
                }}>
                  <ThunderboltOutlined style={{ fontSize: 26, color: '#000000', marginBottom: 6 }} />
                  <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 900, color: '#000000', fontSize: 15 }}>COD KAMPUS</Title>
                  <Text style={{ fontWeight: 700, color: '#000000', fontSize: 11, lineHeight: 1.4, display: 'block' }}>Bebas Ongkir di Student Center / Dormitory</Text>
                </div>
              </Col>

              <Col span={12}>
                <div style={{
                  background: '#ff2a85',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  boxShadow: '5px 5px 0px #000000',
                  borderRadius: 16,
                  padding: '16px'
                }}>
                  <DollarOutlined style={{ fontSize: 26, color: '#ffffff', marginBottom: 6 }} />
                  <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 900, color: '#ffffff', fontSize: 15 }}>0% ADMIN</Title>
                  <Text style={{ fontWeight: 700, color: '#ffffff', fontSize: 11, lineHeight: 1.4, display: 'block' }}>Uang jualan 100% utuh untuk penjual</Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
