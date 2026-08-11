'use client';

import Link from 'next/link';
import { Row, Col, Typography, Divider, Space, Flex } from 'antd';
import { ShopOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function Footer() {
  return (
    <footer style={{ background: '#0b192c', color: '#94a3b8', padding: '56px 24px 32px 24px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                background: 'linear-gradient(135deg, #0052cc 0%, #06b6d4 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(6,182,212,0.3)'
              }}>
                <ShopOutlined style={{ fontSize: 20, color: '#ffffff' }} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>
                Pres<span style={{ color: '#0052cc' }}>U</span><span style={{ color: '#06b6d4' }}>Mart</span>
              </span>
            </Link>
            <Paragraph style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
              Platform jual beli resmi khusus mahasiswa President University Jababeka. Transaksi COD aman, cepat, dan bebas biaya admin.
            </Paragraph>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#ffffff', marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Navigasi</Title>
            <Flex vertical gap="small">
              <Link href="/" style={{ color: '#94a3b8', fontSize: 13 }}>Beranda</Link>
              <Link href="/sell" style={{ color: '#94a3b8', fontSize: 13 }}>Jual Barang</Link>
              <Link href="/cart" style={{ color: '#94a3b8', fontSize: 13 }}>Keranjang</Link>
              <Link href="/profile" style={{ color: '#94a3b8', fontSize: 13 }}>Profil & Pesanan</Link>
            </Flex>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#ffffff', marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Kategori Populer</Title>
            <Flex vertical gap="small">
              <Link href="/?cat=Elektronik" style={{ color: '#94a3b8', fontSize: 13 }}>Elektronik & Gadget</Link>
              <Link href="/?cat=Buku+%26+Alat+Tulis" style={{ color: '#94a3b8', fontSize: 13 }}>Buku Kuliah & Catatan</Link>
              <Link href="/?cat=Pakaian" style={{ color: '#94a3b8', fontSize: 13 }}>Fashion & Apparel</Link>
              <Link href="/?cat=Kos+%26+Furniture" style={{ color: '#94a3b8', fontSize: 13 }}>Perlengkapan Kost</Link>
            </Flex>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#ffffff', marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Lokasi Kampus</Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#06b6d4' }} />
              President University, Jl. Ki Hajar Dewantara, Kota Jababeka, Cikarang Utara, Jawa Barat 17550.
            </Paragraph>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '36px 0 24px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            © {new Date().getFullYear()} PresUMart - President University. Hak Cipta Dilindungi.
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
            Dikembangkan oleh <span style={{ color: '#00f2fe', fontWeight: 600 }}>Anak Mamah</span>
          </Text>
        </div>
      </div>
    </footer>
  );
}
