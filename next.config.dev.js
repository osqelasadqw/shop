/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  useFileSystemPublicRoutes: true,
  
  // Add empty basePath for local development
  basePath: '',
  
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
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
    }
    return config;
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 