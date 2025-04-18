import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-6">404 - გვერდი ვერ მოიძებნა</h1>
      <p className="text-xl mb-8 text-center text-gray-600">
        თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს.
      </p>
      <Link href="/shop" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        მთავარ გვერდზე დაბრუნება
      </Link>
    </div>
  );
} 