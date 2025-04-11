import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
