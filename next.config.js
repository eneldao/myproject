/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['knozavomplxdbbmbmmuk.supabase.co'], // Allow Supabase storage domain
    unoptimized: false, // Enable Vercel's image optimization
  },
  swcMinify: true, // Use SWC for minification
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
};

module.exports = nextConfig; 