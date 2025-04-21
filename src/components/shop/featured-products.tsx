'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const router = useRouter();

  const handleProductClick = (productId: string) => {
    // Check if we're running on GitHub Pages
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      // GitHub Pages approach: use localStorage + static page
      localStorage.setItem('currentProductId', productId);
      window.location.href = `${window.location.origin}/shop/static-product`;
    } else {
      // Normal Next.js approach: use dynamic routing
      router.push(`/shop/product/${productId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p, index) => (
        <div 
          key={p.id} 
          className="cursor-pointer border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all bg-white"
          onClick={() => handleProductClick(p.id)}
        >
          <div className="relative h-48 sm:h-60 md:h-72 overflow-hidden">
            <Image
              src={p.images[0] || '/placeholder.png'}
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
          <div className="p-3">
            <h3 className="font-medium text-sm md:text-base mb-1 line-clamp-1">{p.name}</h3>
            <p className="text-sm font-semibold">
              {new Intl.NumberFormat('ka-GE', {
                style: 'currency',
                currency: 'GEL',
                maximumFractionDigits: 0
              }).format(p.price)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 