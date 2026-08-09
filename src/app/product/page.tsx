import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductDetail from '../../components/product/ProductDetail';

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = params.id;
  const baseUrl = 'https://presumart.netlify.app';

  if (!id) {
    return {
      title: 'Detail Produk - PresUMart',
      description: 'Platform Jual Beli COD Khusus Mahasiswa President University Jababeka.',
    };
  }

  return {
    title: 'Detail Produk - PresUMart',
    description: 'Beli barang bekas & baru berkualitas dari mahasiswa President University Jababeka di PresUMart.',
    openGraph: {
      title: 'Detail Produk | PresUMart President University',
      description: 'Beli barang bekas & baru berkualitas dari mahasiswa President University Jababeka di PresUMart.',
      url: `${baseUrl}/product?id=${id}`,
      siteName: 'PresUMart',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Detail Produk | PresUMart President University',
      description: 'Beli barang bekas & baru berkualitas dari mahasiswa President University Jababeka di PresUMart.',
    },
  };
}

export default function ProductPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ maxWidth: 1240, margin: '40px auto', padding: '0 24px', textAlign: 'center', color: '#64748b' }}>Memuat rincian produk...</div>}>
        <ProductDetail />
      </Suspense>
      <Footer />
    </>
  );
}
