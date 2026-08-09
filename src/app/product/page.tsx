import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductDetail from '../../components/product/ProductDetail';

type Props = {
  searchParams: Promise<{ id?: string; title?: string; price?: string; img?: string; desc?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = 'https://presumart.netlify.app';

  const rawTitle = params.title ? decodeURIComponent(params.title) : '';
  const rawPrice = params.price ? Number(params.price) : 0;
  const formattedPrice = rawPrice > 0 ? `Rp${rawPrice.toLocaleString('id-ID')}` : '';
  const rawImg = params.img ? decodeURIComponent(params.img) : '';
  const rawDesc = params.desc ? decodeURIComponent(params.desc) : '';

  const displayTitle = rawTitle
    ? `${rawTitle} ${formattedPrice ? `(${formattedPrice})` : ''} - PresUMart`
    : 'PresUMart - President University Marketplace';

  const displayDesc = rawDesc
    ? `${formattedPrice ? `${formattedPrice} • ` : ''}${rawDesc.substring(0, 160)}`
    : `${formattedPrice ? `Beli ${rawTitle} seharga ${formattedPrice} di PresUMart. ` : ''}Platform Jual Beli COD Khusus Mahasiswa President University Jababeka.`;

  let fullImageUrl = `${baseUrl}/icon-512.svg`;
  if (rawImg) {
    if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
      fullImageUrl = rawImg;
    } else if (rawImg.startsWith('/')) {
      fullImageUrl = `${baseUrl}${rawImg}`;
    } else {
      fullImageUrl = `${baseUrl}/${rawImg}`;
    }
  }

  const shareUrl = params.id 
    ? `${baseUrl}/product?id=${params.id}`
    : baseUrl;

  return {
    title: displayTitle,
    description: displayDesc,
    openGraph: {
      title: displayTitle,
      description: displayDesc,
      url: shareUrl,
      siteName: 'PresUMart President University',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: rawTitle || 'Foto Produk PresUMart',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: displayDesc,
      images: [fullImageUrl],
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
