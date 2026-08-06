import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import HomeContent from './HomeContent';

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
