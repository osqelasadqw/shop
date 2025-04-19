/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'placehold.co',
    ],
    unoptimized: true,
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