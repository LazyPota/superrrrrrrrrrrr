import { Suspense } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductDetail from '../../components/product/ProductDetail';

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
