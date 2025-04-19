import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">გამორჩეული პროდუქტები</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, index) => (
            <Link key={p.id} href={`/shop/product/${p.id}`}>
              <div className="group rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative h-48 sm:h-60 md:h-72 overflow-hidden">
                  <Image
                    src={p.images && p.images[0] ? p.images[0] : '/placeholder.png'}
                    alt={p.name}
                    fill
                    className="object-contain transition-transform duration-200 hover:scale-105"
                    loading={index < 2 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.png';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{p.name}</h3>
                  <p className="text-red-600 font-bold">{p.price} ₾</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 