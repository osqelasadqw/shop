/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/shop',
  assetPrefix: '/shop/',
  trailingSlash: true,
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
    unoptimized: true,
  },
};

module.exports = nextConfig; 