import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // Optional: specify port if needed
        // port: '', 
        // Optional: specify pathname if your URLs follow a pattern
        // pathname: '/v0/b/your-project-id.appspot.com/o/**',
      },
      {
        // Add placeholder image domain
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        // Add flaticon domain for payment icons
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        // Add Google user profile photos domain
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
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
