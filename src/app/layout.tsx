import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import theme from "../theme/themeConfig";
import ChatWidget from "../components/chat/ChatWidget";
import PWAInstallPrompt from "../components/common/PWAInstallPrompt";

export const metadata = {
  title: "PresUMart - President University Marketplace",
  description: "Platform Jual Beli COD Khusus Mahasiswa President University Jababeka.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PresUMart",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0052cc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PresUMart" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
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
