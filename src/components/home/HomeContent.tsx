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
  LaptopOutlined,
  FireOutlined
} from '@ant-design/icons';
import ProductCard from '../product/ProductCard';
import { getProducts, saveProducts } from '../../lib/store';
import CATEGORIES from '../../data/categories';

const { Title, Text } = Typography;

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

      {/* Neobrutalist Category Pills Bar */}
      <div style={{ marginBottom: 28, overflowX: 'auto', paddingBottom: 8, display: 'flex', gap: 10 }}>
        {categoriesWithAll.map(cat => {
          const isActive = activeCat === cat;
          return (
            <div
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`neo-pill ${isActive ? 'active' : ''}`}
            >
              {CATEGORY_ICONS[cat] || <AppstoreOutlined />}
              <span>{cat.toUpperCase()}</span>
            </div>
          );
        })}
      </div>

      {/* Catalog Controls Header */}
      <div id="produk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '2rem', fontFamily: 'Syne, sans-serif', color: '#000000' }}>
            KATALOG <span style={{ background: '#00f0ff', padding: '2px 10px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>PRODUK</span>
          </Title>
          <Text style={{ fontWeight: 700, color: '#000000', fontSize: 13 }}>
            {search ? `Hasil pencarian "${search}" (${filtered.length} produk)` : `Menampilkan ${filtered.length} barang siap dibeli`}
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
            <button
              style={{
                background: '#ffe600',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 14,
                padding: '10px 20px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <PlusOutlined /> JUAL BARANG!
            </button>
          </Link>
        </div>
      </div>

      {/* Condition Pills */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text strong style={{ fontSize: 12, color: '#000000', marginRight: 4, textTransform: 'uppercase' }}>KONDISI:</Text>
        {[
          { label: 'SEMUA KONDISI', value: 'Semua' },
          { label: '✨ BARANG BARU', value: 'Barang Baru' },
          { label: '🌟 BEKAS - LIKE NEW', value: 'Bekas - Like New' },
          { label: '👍 BEKAS - MULUS', value: 'Bekas - Mulus' },
        ].map(cond => (
          <button
            key={cond.value}
            onClick={() => setActiveCond(cond.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 800,
              border: '2px solid #000000',
              boxShadow: activeCond === cond.value ? '3px 3px 0px #000000' : '2px 2px 0px #000000',
              background: activeCond === cond.value ? '#ff2a85' : '#ffffff',
              color: activeCond === cond.value ? '#ffffff' : '#000000',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cond.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="neo-card" style={{ padding: '64px 24px', textAlign: 'center', background: '#ffffff' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ marginBottom: 4, fontFamily: 'Syne, sans-serif', fontWeight: 900 }}>PRODUK TIDAK DITEMUKAN!</Title>
                <Text style={{ fontWeight: 700, color: '#666' }}>
                  Belum ada produk di kategori ini.
                </Text>
              </div>
            }
          >
            <Link href="/sell">
              <button style={{ background: '#ffe600', border: '3px solid #000', boxShadow: '4px 4px 0px #000', padding: '12px 24px', fontWeight: 900, borderRadius: 12, cursor: 'pointer' }}>
                JUAL BARANG PERTAMA!
              </button>
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

      {/* Trust Grid Neobrutalist */}
      <div style={{ marginTop: 64 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="neo-card neo-card-yellow" style={{ padding: '24px', textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 36, color: '#000000', marginBottom: 8 }} />
              <Title level={4} style={{ margin: '0 0 6px 0', fontWeight: 900, color: '#000000' }}>100% TERVERIFIKASI</Title>
              <Text style={{ fontWeight: 700, color: '#000000', fontSize: 13 }}>Khusus mahasiswa President University dengan email @student.president.ac.id.</Text>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="neo-card neo-card-cyan" style={{ padding: '24px', textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 36, color: '#000000', marginBottom: 8 }} />
              <Title level={4} style={{ margin: '0 0 6px 0', fontWeight: 900, color: '#000000' }}>COD KAMPUS JABABEKAN</Title>
              <Text style={{ fontWeight: 700, color: '#000000', fontSize: 13 }}>Ketemuan langsung di Student Center tanpa biaya ongkir.</Text>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="neo-card neo-card-pink" style={{ padding: '24px', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 36, color: '#ffffff', marginBottom: 8 }} />
              <Title level={4} style={{ margin: '0 0 6px 0', fontWeight: 900, color: '#ffffff' }}>0% BIAYA ADMIN</Title>
              <Text style={{ fontWeight: 700, color: '#ffffff', fontSize: 13 }}>Hasil penjualan 100% utuh milik penjual tanpa potongan komisi.</Text>
            </div>
          </Col>
        </Row>
      </div>

    </main>
  );
}
