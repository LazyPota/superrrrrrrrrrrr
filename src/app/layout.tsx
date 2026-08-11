import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import theme from "../theme/themeConfig";
import ChatWidget from "../components/chat/ChatWidget";
import PWAInstallPrompt from "../components/common/PWAInstallPrompt";

export const metadata = {
  title: "PresUMart - Marketplace Mahasiswa President University",
  description: "Platform Jual Beli COD Khusus Mahasiswa President University Jababeka. Transaksi aman, hemat, dan praktis di lingkungan kampus.",
  keywords: ["PresUMart", "President University", "Marketplace Mahasiswa", "Jual Beli President Univ", "COD Kampus Jababeka", "PresUniv Store"],
  authors: [{ name: "PresUMart Team" }],
  manifest: "/manifest.json",
  metadataBase: new URL("https://presumart.netlify.app"),
  openGraph: {
    title: "PresUMart - Marketplace Mahasiswa President University",
    description: "Platform Jual Beli COD Khusus Mahasiswa President University Jababeka.",
    url: "https://presumart.netlify.app",
    siteName: "PresUMart",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "PresUMart Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PresUMart - Marketplace Mahasiswa President University",
    description: "Platform Jual Beli COD Khusus Mahasiswa President University Jababeka.",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PresUMart",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffe600",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineMarketplace",
  "name": "PresUMart",
  "url": "https://presumart.netlify.app",
  "logo": "https://presumart.netlify.app/logo.png",
  "description": "Marketplace jual beli COD khusus mahasiswa President University Jababeka.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cikarang Utara",
    "addressRegion": "Jawa Barat",
    "addressCountry": "ID"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PresUMart" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            {children}
            <ChatWidget />
            <PWAInstallPrompt />
          </ConfigProvider>
        </AntdRegistry>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
