import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/shop',
  assetPrefix: '/shop/',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // დავამატოთ კონფიგურაცია ჰიდრაციის გაფრთხილებების უგულებელყოფისთვის
  onDemandEntries: {
    // პერიოდი, რომლის განმავლობაშიც კომპილირებული გვერდები რჩება მეხსიერებაში
    maxInactiveAge: 25 * 1000,
    // კომპილირებული გვერდების მაქსიმალური რაოდენობა მეხსიერებაში
    pagesBufferLength: 2,
  },
  // webpack კონფიგურაცია
  webpack: (config, { dev, isServer }) => {
    // ჰიდრაციის გაფრთხილებების გამორთვა დეველოპერ რეჟიმში
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
    }
    return config;
  }
};

export default nextConfig;
