/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/shop',
  typescript: {
    // ჩავთიშოთ typescript შემოწმება ბილდის დროს
    // იგნორირებული იქნება შეცდომები ტიპებთან დაკავშირებით
    ignoreBuildErrors: true,
  },
  eslint: {
    // ჩავთიშოთ eslint შემოწმება ბილდის დროს
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn-icons-png.flaticon.com', 'firebasestorage.googleapis.com', 'placehold.co', 'lh3.googleusercontent.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
};

module.exports = nextConfig; 