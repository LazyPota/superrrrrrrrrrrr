'use client';

import Link from 'next/link';
import { Row, Col, Typography, Divider, Flex } from 'antd';
import { ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function Footer() {
  return (
    <footer style={{ background: '#ffe600', color: '#000000', borderTop: '4px solid #000000', padding: '56px 24px 32px 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
              <img 
                src="/logo.png" 
                alt="PresUMart Logo" 
                style={{ 
                  height: 52, 
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(3px 3px 0px #000000)'
                }} 
              />
            </Link>
            <Paragraph style={{ color: '#000000', fontWeight: 700, fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
              Platform jual beli resmi khusus mahasiswa President University Jababeka. Transaksi COD aman, cepat, dan 100% bebas biaya admin.
            </Paragraph>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#000000', marginBottom: 16, fontSize: 16, fontWeight: 900 }}>NAVIGASI</Title>
            <Flex vertical gap="small">
              <Link href="/" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Beranda</Link>
              <Link href="/sell" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Jual Barang</Link>
              <Link href="/cart" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Keranjang</Link>
              <Link href="/profile" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Profil & Pesanan</Link>
            </Flex>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Title level={5} style={{ color: '#000000', marginBottom: 16, fontSize: 16, fontWeight: 900 }}>KATEGORI POPULER</Title>
            <Flex vertical gap="small">
              <Link href="/?cat=Elektronik" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Elektronik & Gadget</Link>
              <Link href="/?cat=Buku+%26+Alat+Tulis" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Buku Kuliah & Catatan</Link>
              <Link href="/?cat=Pakaian" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Fashion & Apparel</Link>
              <Link href="/?cat=Kos+%26+Furniture" style={{ color: '#000000', fontWeight: 700, fontSize: 13 }}>Perlengkapan Kost</Link>
            </Flex>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#000000', marginBottom: 16, fontSize: 16, fontWeight: 900 }}>LOKASI KAMPUS</Title>
            <Paragraph style={{ color: '#000000', fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#ff2a85' }} />
              President University, Jl. Ki Hajar Dewantara, Kota Jababeka, Cikarang Utara, Jawa Barat 17550.
            </Paragraph>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#000000', borderWidth: 2, margin: '36px 0 24px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ color: '#000000', fontWeight: 800, fontSize: 12 }}>
            © {new Date().getFullYear()} PresUMart - President University. Hak Cipta Dilindungi.
          </Text>
          <Text style={{ color: '#000000', fontWeight: 800, fontSize: 12 }}>
            Dikembangkan oleh <span style={{ background: '#00f0ff', padding: '2px 8px', border: '2px solid #000' }}>Anak Mamah</span>
          </Text>
        </div>
      </div>
    </footer>
  );
}
