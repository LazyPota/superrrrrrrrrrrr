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
      <Suspense>
        <HomeContent />
      </Suspense>
      <Footer />
    </>
  );
}
