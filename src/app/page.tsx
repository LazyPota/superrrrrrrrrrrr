import { Suspense } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/common/Hero';
import HomeContent from '../components/home/HomeContent';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Suspense fallback={<div style={{ maxWidth: 1240, margin: '40px auto', padding: '0 24px', textAlign: 'center', color: '#64748b' }}>Memuat produk...</div>}>
        <HomeContent />
      </Suspense>
      <Footer />
    </>
  );
}
