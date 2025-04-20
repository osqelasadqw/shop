'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-rose-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">გვერდი ვერ მოიძებნა</h2>
        <p className="text-lg text-gray-600 mb-8">
          სამწუხაროდ, თქვენ მიერ მოთხოვნილი გვერდი ვერ მოიძებნა.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-md bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
        >
          დაბრუნდით მთავარ გვერდზე
        </Link>
      </div>
    </div>
  );
} 