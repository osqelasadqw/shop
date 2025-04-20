/** @type {import('next').NextConfig} */

const nextConfig = {
  // სტატიკური ექსპორტის ჩართვა GitHub Pages-ისთვის
  output: "export", 
  // განვსაზღვროთ საიტის ბილდის დირექტორია
  distDir: 'out',
  
  // განვაახლოთ GitHub Pages-ისთვის - 'shop' არის რეპოზიტორიის სახელი
  basePath: '/shop',
  assetPrefix: '/shop',
  trailingSlash: true,
  reactStrictMode: true,
  
  // ჩავრთოთ ფაილური სისტემის რუტები
  useFileSystemPublicRoutes: true,
  
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
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  
  // გადატანილია experimental-იდან
  serverExternalPackages: [],
  
  // სურათების კონფიგურაცია
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

module.exports = nextConfig; 