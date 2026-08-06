'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Row, Col, Segmented, Empty, Button, Typography, Alert, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProductCard from '../product/ProductCard';
import { getProducts, saveProducts } from '../../lib/store';
import SEED_PRODUCTS from '../../data/seed';
import CATEGORIES from '../../data/categories';

const { Title, Text } = Typography;

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || 'Semua');
  const [activeCond, setActiveCond] = useState('Semua');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const urlSearch = searchParams.get('search') || '';
  const urlCat = searchParams.get('cat') || '';

  useEffect(() => {
    const stored = getProducts();
    if (stored.length === 0) {
      saveProducts(SEED_PRODUCTS);
      setProducts(SEED_PRODUCTS);
    } else {
      const merged = new Map();
      SEED_PRODUCTS.forEach(p => merged.set(p.id, p));
      stored.forEach(p => merged.set(p.id, p));
      setProducts(Array.from(merged.values()));
    }
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
    return [...list].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, activeCat, activeCond, search]);

  const segmentedOptions = ['Semua', ...CATEGORIES];

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px 48px 24px' }}>
      <Alert
        title="Terverifikasi Mahasiswa PresUniv"
        description="Semua produk dijual langsung oleh mahasiswa aktif President University Jababeka."
        type="info"
        showIcon
        style={{ marginBottom: 28, borderRadius: 12 }}
      />

      <div id="produk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Produk <span style={{ color: '#0052cc' }}>Tersedia</span>
          </Title>
          <Text type="secondary">
            {search ? `Menampilkan hasil pencarian "${search}" (${filtered.length} produk)` : `Total ${filtered.length} barang siap dibeli`}
          </Text>
        </div>

        <Link href="/sell">
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            Jual Barang Baru
          </Button>
        </Link>
      </div>

      {/* Category Segmented Controls */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
        <Segmented
          options={segmentedOptions}
          value={activeCat}
          onChange={val => setActiveCat(val as string)}
          size="large"
          style={{ background: '#e2e8f0', padding: 4, borderRadius: 12 }}
        />
      </div>

      {/* Condition Filter Tag Bar */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text strong style={{ fontSize: 13, color: '#64748b', marginRight: 4 }}>Filter Kondisi:</Text>
        {[
          { label: 'Semua Kondisi', value: 'Semua' },
          { label: '✨ Barang Baru', value: 'Barang Baru' },
          { label: '🌟 Bekas - Seperti Baru', value: 'Bekas - Like New' },
          { label: '👍 Bekas - Mulus', value: 'Bekas - Mulus' },
        ].map(cond => (
          <Tag.CheckableTag
            key={cond.value}
            checked={activeCond === cond.value}
            onChange={() => setActiveCond(cond.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              border: activeCond === cond.value ? '1px solid #0052cc' : '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
          >
            {cond.label}
          </Tag.CheckableTag>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ marginBottom: 4 }}>Produk tidak ditemukan</Title>
                <Text type="secondary">
                  Belum ada produk di kategori ini, atau kata kunci pencarianmu tidak cocok.
                </Text>
              </div>
            }
          >
            <Link href="/sell">
              <Button type="primary" size="large" icon={<PlusOutlined />}>
                Jual Barang Pertamamu
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </main>
  );
}
