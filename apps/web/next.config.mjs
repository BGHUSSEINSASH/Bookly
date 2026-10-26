/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // تجاهل أخطاء ESLint والـ TypeScript أثناء البناء (يُتحقق منها في CI)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    viewTransition: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**.netlify.app' },
      { protocol: 'https', hostname: '**.up.railway.app' },
    ],
  },
};

export default nextConfig;
