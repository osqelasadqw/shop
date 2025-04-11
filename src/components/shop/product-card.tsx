'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Default image if no images are available
  const defaultImage = 'https://placehold.co/400x400/eee/999?text=No+Image';
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : defaultImage;

  return (
    <Link 
      href={`/shop/product/${product.id}`} 
      className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all bg-white"
    >
      {/* Single container for image, text, and button */}
      <div className="flex flex-col h-full">
        {/* Image container */}
        <div className="aspect-square flex items-center justify-center relative overflow-hidden">
          <Image
            src={productImage}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            className="group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Content container (name, price, button) */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-base mb-1 flex-grow">{product.name}</h3>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm font-semibold text-gray-900">
              {new Intl.NumberFormat('ka-GE', {
                style: 'currency',
                currency: 'GEL',
              }).format(product.price)}
            </p>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full -mr-2 -mb-2" // Adjust margin for alignment
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
} 