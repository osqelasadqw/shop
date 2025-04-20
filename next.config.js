/** @type {import('next').NextConfig} */

const nextConfig = {
  // Base configuration for GitHub Pages
  basePath: '/shop',
  assetPrefix: '/shop',
  trailingSlash: true,
  reactStrictMode: true,
  
  experimental: {
    esmExternals: 'loose',
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'placehold.co',
      'cdn-icons-png.flaticon.com',
    ],
    unoptimized: true,
    minimumCacheTTL: 60,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 