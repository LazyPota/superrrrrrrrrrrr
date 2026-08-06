'use client';

import Link from 'next/link';
import { Row, Col, Typography, Divider, Space, Flex } from 'antd';
import { ShopOutlined, EnvironmentOutlined, CodeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 24px 24px 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Space align="center" style={{ marginBottom: 12 }}>
              <ShopOutlined style={{ fontSize: 24, color: '#38bdf8' }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>PresUMart</span>
            </Space>
            <Paragraph style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              Platform jual beli resmi khusus komunitas mahasiswa President University.
              Transaksi aman, cepat, dan terpercaya antar sesama mahasiswa.
            </Paragraph>
            <div style={{ marginTop: 12 }}>
              <a
                href="https://presuit26.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <CodeOutlined /> Created by IT Major Batch 2026
              </a>
            </div>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Navigasi</Title>
            <Flex vertical gap="small">
              <Link href="/" style={{ color: '#94a3b8' }}>Beranda</Link>
              <Link href="/sell" style={{ color: '#94a3b8' }}>Jual Barang</Link>
              <Link href="/cart" style={{ color: '#94a3b8' }}>Keranjang</Link>
              <Link href="/profile" style={{ color: '#94a3b8' }}>Profil Saya</Link>
            </Flex>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Kategori Popular</Title>
            <Flex vertical gap="small">
              <Link href="/?cat=Elektronik" style={{ color: '#94a3b8' }}>Elektronik</Link>
              <Link href="/?cat=Buku+%26+Alat+Tulis" style={{ color: '#94a3b8' }}>Buku & Alat Tulis</Link>
              <Link href="/?cat=Pakaian" style={{ color: '#94a3b8' }}>Pakaian</Link>
              <Link href="/?cat=Kos+%26+Furniture" style={{ color: '#94a3b8' }}>Kos & Furniture</Link>
            </Flex>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Lokasi Kampus</Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#38bdf8' }} />
              President University, Jl. Ki Hajar Dewantara, Kota Jababeka, Cikarang, Jawa Barat 17550.
            </Paragraph>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#334155', margin: '32px 0 24px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            © {new Date().getFullYear()} PresUMart - President University. Hak Cipta Dilindungi.
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
            Developed with excellence by{' '}
            <a
              href="https://presuit26.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', fontWeight: 600 }}
            >
              Information Technology Major (Batch 2026)
            </a>
          </Text>
        </div>
      </div>
    </footer>
  );
}
