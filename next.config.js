/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  
  useFileSystemPublicRoutes: true,
  
  outputFileTracingExcludes: {
    '/admin/products/**': [
      'node_modules/**',
    ],
    '/shop/product/**': [
      'node_modules/**',
    ],
  },
  
  experimental: {
    // ვალიდური პარამეტრების სია Next.js 15.2.4-ისთვის
    esmExternals: 'loose',
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  
  serverExternalPackages: [],
  
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
  
  // webpack კონფიგურაცია
  webpack: (config, { dev, isServer }) => {
    // ჰიდრაციის გაფრთხილებების გამორთვა დეველოპერ რეჟიმში
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
    }
    
    // წვდომის RSC ფაილების თავიდან არიდება GitHub Pages-ზე
    if (!isServer) {
      config.resolve.alias['next/dist/server/future/route-modules/app-page/module'] = 
        require.resolve('./utils/app-page-module-shim.js');
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

const fs = require('fs');
const path = require('path');

// შევასრულოთ postBuild ფუნქცია ცალკე, არა next.config.js-ის ნაწილად
if (typeof require !== 'undefined' && require.main === module) {
  try {
    // შემოწმება არსებობს თუ არა public/404.html
    if (fs.existsSync(path.join(process.cwd(), 'public', '404.html'))) {
      // წაკითხვა
      const content = fs.readFileSync(
        path.join(process.cwd(), 'public', '404.html'),
        'utf8'
      );
      
      // დაწერა out/404.html გზაზე
      fs.writeFileSync(
        path.join(process.cwd(), 'out', '404.html'),
        content,
        'utf8'
      );
      
      console.log('✅ 404.html ფაილი წარმატებით დაკოპირდა out დირექტორიაში');
    } else {
      console.warn('⚠️ public/404.html ფაილი ვერ მოიძებნა');
    }
  } catch (error) {
    console.error('❌ 404.html ფაილის კოპირების შეცდომა:', error);
  }
}

module.exports = nextConfig; 