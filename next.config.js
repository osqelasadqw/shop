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
  
  // RSC ფაილებთან დაკავშირებული პრობლემების გადაჭრა
  useFileSystemPublicRoutes: false,
  optimizeFonts: false,
  
  // აღვარიდოთ თავი RSC-სთან დაკავშირებულ პრობლემებს
  experimental: {
    // ნებისმიერი RSC ჩატვირთვა კლიენტის მხარეს
    appDir: true,
    // გამოვრთოთ RSC ფაილების გენერაცია სტატიკური ექსპორტისთვის
    disableStaticImages: true,
    // არ შევქმნათ RSC ფაილები სტატიკური ექსპორტისას
    serverComponentsExternalPackages: [],
    // ვარკევთ დინამიურ მარშრუტებს
    outputFileTracingExcludes: {
      '/admin/products/**': [
        'node_modules/**',
      ],
      '/shop/product/**': [
        'node_modules/**',
      ],
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