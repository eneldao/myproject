/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'knozavomplxdbbmbmmuk.supabase.co',
        pathname: '/**',
      },
    ],
    unoptimized: false, // Enable Vercel's image optimization
  },
  swcMinify: true, // Use SWC for minification
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
};

module.exports = nextConfig; 