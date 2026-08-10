/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ['192.168.1.6', 'localhost:3000'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://gggcvgbkrskywxtnptid.supabase.co wss://gggcvgbkrskywxtnptid.supabase.co https://api.gutstore.my.id; frame-ancestors 'none'; upgrade-insecure-requests;" },
        ],
      },
    ];
  },
};

export default nextConfig;
