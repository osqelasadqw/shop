'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { getProductById } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/providers/cart-provider';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        if (typeof id === 'string') {
          const productData = await getProductById(id);
          setProduct(productData);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3 mt-8"></div>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (!product) {
    return (
      <ShopLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">პროდუქტი ვერ მოიძებნა</h2>
          <p className="text-muted-foreground">
            მითითებული პროდუქტი არ არსებობს ან წაშლილია.
          </p>
        </div>
      </ShopLayout>
    );
  }

  // Default image if no images are available
  const defaultImage = 'https://placehold.co/600x600/eee/999?text=No+Image';
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : defaultImage;

  return (
    <ShopLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-3">
            <p className="text-2xl font-semibold">
              {new Intl.NumberFormat('ka-GE', {
                style: 'currency',
                currency: 'GEL',
              }).format(product.price)}
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <p className="text-base text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button 
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                კალათში დამატება
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
} 