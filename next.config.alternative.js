/** @type {import('next').NextConfig} */

const nextConfig = {
  // დეველოპმენტისთვის: output: export წაშლილია
  // სტატიკური ექსპორტისთვის დააბრუნეთ შემდეგი ხაზი
  // output: "export",
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,
  reactStrictMode: true,
  
  // აღვარიდოთ თავი RSC-სთან დაკავშირებულ პრობლემებს
  experimental: {
    // ნებისმიერი RSC ჩატვირთვა კლიენტის მხარეს
    appDir: true,
    // დინამიური მარშრუტების ჩართვა (მხოლოდ SSR რეჟიმში)
    dynamicParams: true,
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
  },
  
  // webpack კონფიგურაცია
  webpack: (config, { dev, isServer }) => {
    // ჰიდრაციის გაფრთხილებების გამორთვა დეველოპერ რეჟიმში
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
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