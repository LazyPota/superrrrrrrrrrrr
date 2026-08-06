import { Suspense } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductDetail from '../../components/product/ProductDetail';

export default function ProductPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <ProductDetail />
      </Suspense>
      <Footer />
    </>
  );
}
