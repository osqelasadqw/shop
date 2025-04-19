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
  
  // ბილდის შემდეგ დამატებული ფუნქციონალი
  onPostBuild: async () => {
    const fs = require('fs');
    const path = require('path');
    
    // 404.html ფაილის კოპირება
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
  },
};

module.exports = nextConfig; 