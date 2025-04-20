'use client';

import React, { useEffect, useState } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import Image from 'next/image';
import { getProductById } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StaticProductPage() {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ID-ის ამოღება localStorage-დან
    const storedId = localStorage.getItem('currentProductId');
    
    if (storedId) {
      setProductId(storedId);
      fetchProduct(storedId);
    } else {
      setError('პროდუქტის ID ვერ მოიძებნა');
      setIsLoading(false);
    }
  }, []);

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const productData = await getProductById(id);
      
      if (!productData) {
        setError('პროდუქტი ვერ მოიძებნა');
      } else {
        setProduct(productData);
      }
    } catch (error) {
      console.error('პროდუქტის ჩატვირთვის შეცდომა:', error);
      setError('პროდუქტის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // ვამზადებთ უკან დასაბრუნებელ URL-ს
  const backToShopUrl = typeof window !== 'undefined' && window.location.origin.includes('github.io')
    ? '/shop/'
    : '/shop';

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="w-full aspect-square relative mb-4">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4].map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-md" />
            ))}
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (error || !product) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">შეცდომა</h2>
          <p className="mb-6">{error || 'უცნობი შეცდომა'}</p>
          <Link href={backToShopUrl}>
            <Button variant="outline">მაღაზიაში დაბრუნება</Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  // Default image if no images are available
  const defaultImage = 'https://placehold.co/600x600/eee/999?text=No+Image';
  const hasMultipleImages = product.images && product.images.length > 1;
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : defaultImage;

  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <Link href={backToShopUrl}>
            <Button variant="outline" size="sm">უკან დაბრუნება</Button>
          </Link>
        </div>

        {/* მთავარი სურათი */}
        <div className="w-full max-w-3xl mx-auto aspect-square relative mb-6 border rounded-md overflow-hidden bg-white">
          <Image
            src={currentImage}
            alt={product.name}
            fill={true}
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
          
          {/* ნავიგაციის ღილაკები */}
          {hasMultipleImages && (
            <>
              <button 
                onClick={prevImage} 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                aria-label="წინა სურათი"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                aria-label="შემდეგი სურათი"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* სურათების გალერეა */}
        {hasMultipleImages && (
          <div className="flex justify-center gap-2 flex-wrap mb-4 max-w-3xl mx-auto">
            {product.images.map((image, index) => (
              <div 
                key={index} 
                className={`cursor-pointer border-2 rounded-md overflow-hidden h-16 w-16 sm:h-20 sm:w-20 ${
                  index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <div className="relative h-full w-full">
                  <Image 
                    src={image} 
                    alt={`${product.name} - სურათი ${index + 1}`} 
                    fill={true}
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
} 