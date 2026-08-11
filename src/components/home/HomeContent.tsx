'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Row, Col, Empty, Button, Typography, Tag, Select } from 'antd';
import { 
  PlusOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined, 
  CheckCircleOutlined,
  AppstoreOutlined,
  BookOutlined,
  SkinOutlined,
  HomeOutlined,
  ToolOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import ProductCard from '../product/ProductCard';
import { getProducts, saveProducts } from '../../lib/store';
import CATEGORIES from '../../data/categories';

const { Title, Text, Paragraph } = Typography;

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Semua': <AppstoreOutlined />,
  'Elektronik': <LaptopOutlined />,
  'Buku & Alat Tulis': <BookOutlined />,
  'Pakaian': <SkinOutlined />,
  'Kos & Furniture': <HomeOutlined />,
  'Lainnya': <ToolOutlined />,
};

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

  const categoriesWithAll = ['Semua', ...CATEGORIES];

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px 64px 20px' }}>

      {/* Category Bento Pill Bar */}
      <div style={{ marginBottom: 28, overflowX: 'auto', paddingBottom: 8, display: 'flex', gap: 10 }}>
        {categoriesWithAll.map(cat => {
          const isActive = activeCat === cat;
          return (
            <div
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`cat-bento-pill ${isActive ? 'active' : ''}`}
            >
              {CATEGORY_ICONS[cat] || <AppstoreOutlined />}
              <span>{cat}</span>
            </div>
          );
        })}
      </div>

      {/* Catalog Control Header */}
      <div id="produk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', fontFamily: 'Syne, sans-serif' }}>
            Katalog <span className="glow-text-primary">Produk Kampus</span>
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {search ? `Hasil pencarian "${search}" (${filtered.length} barang)` : `Menampilkan ${filtered.length} produk siap dibeli`}
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              style={{
                borderRadius: 99,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00f2fe 0%, #0052cc 100%)',
                color: '#090d16',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0, 242, 254, 0.3)'
              }}
            >
              Jual Barang
            </Button>
          </Link>
        </div>
      </div>

      {/* Condition Filter Checkable Bar */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text strong style={{ fontSize: 12, color: '#64748b', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kondisi:</Text>
        {[
          { label: 'Semua Kondisi', value: 'Semua' },
          { label: '✨ Barang Baru', value: 'Barang Baru' },
          { label: '🌟 Bekas - Like New', value: 'Bekas - Like New' },
          { label: '👍 Bekas - Mulus', value: 'Bekas - Mulus' },
        ].map(cond => (
          <Tag.CheckableTag
            key={cond.value}
            checked={activeCond === cond.value}
            onChange={() => setActiveCond(cond.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              border: activeCond === cond.value ? '1px solid #0052cc' : '1px solid #cbd5e1',
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

      {/* Product Bento Grid */}
      {filtered.length === 0 ? (
        <div className="bento-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Produk Tidak Ditemukan</Title>
                <Text type="secondary" style={{ maxWidth: 400, display: 'block', margin: '0 auto 20px auto' }}>
                  Belum ada barang untuk kategori atau kata kunci ini.
                </Text>
              </div>
            }
          >
            <Link href="/sell">
              <Button type="primary" size="large" icon={<PlusOutlined />} style={{ borderRadius: 99, fontWeight: 800, background: '#0052cc', border: 'none' }}>
                Jual Barang Pertama
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(product => (
            <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}

      {/* Trust Bento Grid */}
      <div style={{ marginTop: 64 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="bento-card bento-dark" style={{ padding: '28px 24px', textAlign: 'center', height: '100%' }}>
              <SafetyCertificateOutlined style={{ fontSize: 36, color: '#00f2fe', marginBottom: 12 }} />
              <Title level={4} style={{ color: '#fff', margin: '0 0 6px 0', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>Terverifikasi Kampus</Title>
              <Paragraph style={{ color: '#94a3b8', margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                Akun khusus mahasiswas President University dengan domain resmi @student.president.ac.id.
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bento-card bento-dark" style={{ padding: '28px 24px', textAlign: 'center', height: '100%' }}>
              <ThunderboltOutlined style={{ fontSize: 36, color: '#f59e0b', marginBottom: 12 }} />
              <Title level={4} style={{ color: '#fff', margin: '0 0 6px 0', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>COD Bebas Ongkir</Title>
              <Paragraph style={{ color: '#94a3b8', margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                Serah terima barang langsung saat ketemuan di area kampus Cikarang Jababeka.
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bento-card bento-dark" style={{ padding: '28px 24px', textAlign: 'center', height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: 36, color: '#10b981', marginBottom: 12 }} />
              <Title level={4} style={{ color: '#fff', margin: '0 0 6px 0', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>0% Biaya Admin</Title>
              <Paragraph style={{ color: '#94a3b8', margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                Bebas komisi platform. Seluruh hasil penjualan 100% utuh milik penjual.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>

    </main>
  );
}
