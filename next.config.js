/** @type {import('next').NextConfig} */

const nextConfig = {
  // სტატიკური ექსპორტის ჩართვა GitHub Pages-ისთვის
  output: "export", 
  // განვსაზღვროთ საიტის ბილდის დირექტორია
  distDir: 'out',
  
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,
  reactStrictMode: true,
  
  // გადატანილია ძირითად დონეზე experimental-იდან
  useFileSystemPublicRoutes: false,
  
  // გადატანილია ძირითად დონეზე experimental-იდან
  outputFileTracingExcludes: {
    '/admin/products/**': [
      'node_modules/**',
    ],
    '/shop/product/**': [
      'node_modules/**',
    ],
  },
  
  // შენარჩუნებულია მხოლოდ ვალიდური ექსპერიმენტული პარამეტრები
  experimental: {
    // ვალიდური პარამეტრების სია Next.js 15.2.4-ისთვის
    esmExternals: 'loose',
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  
  // გადატანილია experimental-იდან
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
    // ავარიდოთ ტიპსკრიპტს შეცდომის გამოტანა ბილდის დროს
    ignoreBuildErrors: true,
  },
  eslint: {
    // ავარიდოთ eslint-ს შეცდომის გამოტანა ბილდის დროს
    ignoreDuringBuilds: true,
  },
};

// onPostBuild ფუნქციონალი გადატანილია ცალკე, რადგან ეს არ არის Next.js-ის ნაწილი
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