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
    <Link href={`/shop/product/${product.id}`} className="group">
      <div className="overflow-hidden rounded-md bg-gray-100 transition-all hover:opacity-90">
        <img
          src={productImage}
          alt={product.name}
          width={400}
          height={400}
          className="h-60 w-full object-cover"
        />
      </div>
      <div className="flex justify-between items-start mt-3">
        <div>
          <h3 className="font-medium text-base">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Intl.NumberFormat('ka-GE', {
              style: 'currency',
              currency: 'GEL',
            }).format(product.price)}
          </p>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 rounded-full" 
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </div>
    </Link>
  );
} 