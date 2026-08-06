import { Suspense } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductDetail from './ProductDetail';

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
