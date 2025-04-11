'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { getProductById, getProductsByCategory } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/providers/cart-provider';
import { ShoppingCart, Minus, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        if (typeof id === 'string') {
          const productData = await getProductById(id);
          setProduct(productData);
          
          // After fetching the product, fetch related products from the same category
          if (productData?.categoryId) {
            fetchRelatedProducts(productData.categoryId, productData.id);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const products = await getProductsByCategory(categoryId);
      // Filter out the current product
      const otherProducts = products.filter(p => p.id !== currentProductId);
      setRelatedProducts(otherProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

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

  const toggleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed);
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
  const hasMultipleImages = product.images && product.images.length > 1;
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : defaultImage;

  return (
    <ShopLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          {/* Main Image */}
          <div 
            className="relative aspect-square overflow-hidden rounded-md bg-white border cursor-pointer flex items-center justify-center"
            onClick={toggleImageZoom}
          >
            <img
              src={currentImage}
              alt={product.name}
              className="h-full w-full object-contain"
            />
            
            {/* Image Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {hasMultipleImages && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - სურათი ${index + 1}`} 
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
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

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">იმავე კატეგორიის პროდუქტები</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Link 
                href={`/shop/product/${relatedProduct.id}`} 
                key={relatedProduct.id}
                className="group"
              >
                <div className="aspect-square rounded-md overflow-hidden bg-white border mb-2 group-hover:shadow-md transition-all flex items-center justify-center">
                  {relatedProduct.images && relatedProduct.images[0] ? (
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{relatedProduct.name}</h3>
                <p className="text-sm font-semibold text-gray-900">₾{relatedProduct.price?.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={toggleImageZoom}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
            onClick={toggleImageZoom}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="w-11/12 h-5/6 relative bg-white rounded-lg p-4 shadow-2xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
            
            {hasMultipleImages && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-3 rounded-full shadow-md hover:bg-opacity-100 transition-all z-10"
                >
                  <ChevronLeft className="h-8 w-8 text-gray-800" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-3 rounded-full shadow-md hover:bg-opacity-100 transition-all z-10"
                >
                  <ChevronRight className="h-8 w-8 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </ShopLayout>
  );
} 