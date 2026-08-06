'use client';

import { Typography, Card, Tag, Button, Row, Col, Space } from 'antd';
import { SafetyCertificateOutlined, RocketOutlined, ShopOutlined, TeamOutlined, CodeOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Hero() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #002b66 0%, #0052cc 60%, #0747a6 100%)', color: '#fff', padding: '48px 24px', borderRadius: '0 0 24px 24px', marginBottom: 32 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={14}>
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color="cyan" icon={<SafetyCertificateOutlined />} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                Marketplace Resmi Mahasiswa PresUniv
              </Tag>
              <Tag color="blue" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                Khusus Komunitas Kampus Jababeka
              </Tag>
            </Space>
            <Title level={1} style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, margin: '12px 0', lineHeight: 1.2 }}>
              Jual & Beli Barang Kampus Dengan Aman & Cepat
            </Title>
            <Paragraph style={{ color: '#e6f0ff', fontSize: '1.1rem', marginBottom: 28, lineHeight: 1.6 }}>
              Temukan buku perkuliahan, perlengkapan kos, barang elektronik, hingga jasa antar mahasiswa President University Jababeka.
            </Paragraph>
            <Space size="middle" wrap>
              <Link href="/sell">
                <Button type="primary" size="large" icon={<RocketOutlined />} style={{ background: '#00b8d9', borderColor: '#00b8d9', height: 48, padding: '0 28px', fontSize: 16 }}>
                  Mulai Jualan
                </Button>
              </Link>
              <a href="#produk">
                <Button ghost size="large" icon={<ShopOutlined />} style={{ height: 48, padding: '0 28px', fontSize: 16, borderColor: '#fff', color: '#fff' }}>
                  Jelajahi Produk
                </Button>
              </a>
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 16 }}>
                  <TeamOutlined style={{ fontSize: 32, color: '#36b37e', marginBottom: 8 }} />
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>100% Mahasiswa</Title>
                  <Paragraph style={{ color: '#c1d7ff', margin: 0, fontSize: 12 }}>Penjual terverifikasi email @president.ac.id</Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 16 }}>
                  <CodeOutlined style={{ fontSize: 32, color: '#ffab00', marginBottom: 8 }} />
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>Transaksi COD</Title>
                  <Paragraph style={{ color: '#c1d7ff', margin: 0, fontSize: 12 }}>Bayar langsung tunai saat ketemuan di kampus</Paragraph>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
