'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Row, Col, Segmented, Empty, Button, Typography, Tag, Select, Card } from 'antd';
import { 
  PlusOutlined, 
  SafetyCertificateOutlined, 
  ShopOutlined, 
  ThunderboltOutlined, 
  TagOutlined, 
  SortAscendingOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import ProductCard from '../product/ProductCard';
import { getProducts, saveProducts } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';
import CATEGORIES from '../../data/categories';

const { Title, Text, Paragraph } = Typography;

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || 'Semua');
  const [activeCond, setActiveCond] = useState('Semua');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const urlSearch = searchParams.get('search') || '';
  const urlCat = searchParams.get('cat') || '';

  useEffect(() => {
    const stored = getProducts();
    const cleanUserProducts = stored.filter((p: any) => p && p.id && !p.id.startsWith('seed-') && !p.id.startsWith('prod-presu-'));
    saveProducts(cleanUserProducts);
    setProducts(cleanUserProducts);
  }, []);

  useEffect(() => {
    setSearch(urlSearch);
    setActiveCat(urlCat || 'Semua');
  }, [urlSearch, urlCat]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat && activeCat !== 'Semua') {
      list = list.filter(p => p.category === activeCat);
    }
    if (activeCond && activeCond !== 'Semua') {
      list = list.filter(p => (p.condition || 'Bekas - Like New') === activeCond);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...list].sort((a: any, b: any) => {
      if (sortBy === 'price-low') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === 'price-high') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, activeCat, activeCond, search, sortBy]);

  const segmentedOptions = ['Semua', ...CATEGORIES];

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px 64px 24px' }}>

      {/* Header Section */}
      <div id="produk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
            Katalog <span className="gradient-text-blue">Produk Kampus</span>
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {search ? `Hasil pencarian untuk "${search}" (${filtered.length} produk)` : `Menampilkan ${filtered.length} barang dari mahasiswa President University`}
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 170 }}
            options={[
              { label: '🔥 Terbaru', value: 'newest' },
              { label: '🏷️ Harga Termurah', value: 'price-low' },
              { label: '💎 Harga Termahal', value: 'price-high' },
            ]}
          />

          <Link href="/sell">
            <Button type="primary" size="large" icon={<PlusOutlined />} className="btn-gradient-primary" style={{ borderRadius: 20, fontWeight: 700 }}>
              Jual Barang
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Scrollable Pill Bar */}
      <div style={{ marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
        <Segmented
          options={segmentedOptions}
          value={activeCat}
          onChange={val => setActiveCat(val as string)}
          size="large"
          style={{ background: '#f1f5f9', padding: 5, borderRadius: 16 }}
        />
      </div>

      {/* Filter Condition Pills */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text strong style={{ fontSize: 13, color: '#64748b', marginRight: 4 }}>Filter Kondisi:</Text>
        {[
          { label: 'Semua Kondisi', value: 'Semua' },
          { label: '✨ Barang Baru (New)', value: 'Barang Baru' },
          { label: '🌟 Bekas - Seperti Baru', value: 'Bekas - Like New' },
          { label: '👍 Bekas - Mulus', value: 'Bekas - Mulus' },
        ].map(cond => (
          <Tag.CheckableTag
            key={cond.value}
            checked={activeCond === cond.value}
            onChange={() => setActiveCond(cond.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              border: activeCond === cond.value ? '1px solid #0052cc' : '1px solid #e2e8f0',
              background: activeCond === cond.value ? '#eff6ff' : '#ffffff',
              color: activeCond === cond.value ? '#0052cc' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cond.label}
          </Tag.CheckableTag>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <Card style={{ borderRadius: 20, padding: '48px 24px', textAlign: 'center', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ marginBottom: 4 }}>Produk Tidak Ditemukan</Title>
                <Text type="secondary" style={{ maxWidth: 400, display: 'block', margin: '0 auto 20px auto' }}>
                  Belum ada produk untuk kategori ini atau kata kunci pencarianmu tidak cocok.
                </Text>
              </div>
            }
          >
            <Link href="/sell">
              <Button type="primary" size="large" icon={<PlusOutlined />} className="btn-gradient-primary" style={{ borderRadius: 20 }}>
                Jual Barang Pertama
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(product => (
            <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}

      {/* Trust & Advantage Banner */}
      <div style={{ marginTop: 64 }}>
        <Card 
          style={{ 
            borderRadius: 24, 
            background: 'linear-gradient(135deg, #0b192c 0%, #0052cc 100%)', 
            color: '#ffffff',
            padding: '24px 16px',
            border: 'none',
            boxShadow: '0 16px 40px rgba(11,25,44,0.2)'
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, color: '#00f2fe' }} />
              </div>
              <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Komunitas Terverifikasi</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 13 }}>
                Seluruh pengguna wajib menggunakan email resmi kampus @president.ac.id.
              </Paragraph>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <ThunderboltOutlined style={{ fontSize: 32, color: '#fcb900' }} />
              </div>
              <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>COD Bebas Ongkir</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 13 }}>
                Serah terima barang langsung di lingkungan kampus Jababeka tanpa ongkir.
              </Paragraph>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#34d399' }} />
              </div>
              <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>0% Biaya Layanan</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 13 }}>
                Bebas dari potongan komisi. Harga pas yang disepakati 100% utuh untuk penjual.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>

    </main>
  );
}
