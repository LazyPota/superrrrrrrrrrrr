import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import theme from "../theme/themeConfig";
import ChatWidget from "../components/chat/ChatWidget";

export const metadata = {
  title: "PresUMart - President University Marketplace",
  description: "Online marketplace khusus mahasiswa President University. Jual beli barang antar mahasiswa dengan mudah dan aman.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            {children}
            <ChatWidget />
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
