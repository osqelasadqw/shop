'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { getProductById, getProductsByCategory } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/providers/cart-provider';
import { ShoppingCart, Minus, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

// წინასწარი შემოტანა სურათის გადიდების კომპონენტისთვის, რომ არ მოხდეს დაყოვნება პირველ გახსნაზე
const ZoomedImageModal = dynamic(() => import('@/components/modals/zoomed-image-modal').then(mod => mod.default), {
  ssr: false,  // SSR გამორთვა რომ გაჭედვა არ მოხდეს
  loading: () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">სურათი იტვირთება...</p>
      </div>
    </div>
  )
});

export default function ProductDetailClient({ id: routeId }: { id?: string }) {
  const [id, setId] = useState(routeId || '');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedSortOption, setRelatedSortOption] = useState<SortOption>('newest');
  const [isPublicDiscount, setIsPublicDiscount] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // გლობალური error სვეტი რომელიც იჭერს RSC ჩატვირთვის შეცდომებს
  useEffect(() => {
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (source && source.includes('index.txt?_rsc=')) {
        return true; // შეცდომა დამუშავებულია
      }
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    return () => {
      window.onerror = originalOnError;
    };
  }, []);

  // იდენტიფიკატორის ამოღება localStorage-დან თუ არ არის მოწოდებული როუტიდან
  useEffect(() => {
    if (!routeId && typeof window !== 'undefined') {
      const storedId = localStorage.getItem('currentProductId');
      if (storedId) {
        console.log('ID ამოღებულია localStorage-დან:', storedId);
        setId(storedId);
      } else {
        // გამოვიტანოთ ურლ-დან ID-ს ამოღების მცდელობა
        try {
          const pathParts = window.location.pathname.split('/');
          console.log('URL გზის ნაწილები:', pathParts);
          
          // უფრო მძლავრი ლოგიკა - ბოლო ნაწილიდან ID-ის ამოღება
          // თუ ბოლო ელემენტი ცარიელია (გზა მთავრდება '/'-ით), მაშინ წინა ელემენტია საჭირო
          let productId;
          
          if (pathParts[pathParts.length - 1] === '') {
            // თუ URL მთავრდება '/'-ით, ID არის წინა ელემენტი
            productId = pathParts[pathParts.length - 2];
          } else {
            // თუ არ არის '/', მაშინ ბოლო ელემენტია ID
            productId = pathParts[pathParts.length - 1];
          }
          
          console.log('ID ამოღებულია URL-დან:', productId);
          
          if (productId) {
            setId(productId);
          } else {
            // ძებნა product ნაწილის შემდეგ
            const productIndex = pathParts.indexOf('product');
            if (productIndex !== -1 && productIndex < pathParts.length - 1) {
              productId = pathParts[productIndex + 1];
              console.log('ID ამოღებულია "product" ნაწილის შემდეგ:', productId);
              setId(productId);
            } else {
              setError('პროდუქტის ID ვერ მოიძებნა');
            }
          }
        } catch (e) {
          console.error('შეცდომა ID-ის ამოღებისას URL-დან:', e);
          setError('პროდუქტის ID ვერ მოიძებნა');
        }
      }
    }
  }, [routeId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        
        console.log('ვიწყებთ პროდუქტის ჩატვირთვას ID-ით:', id);
        const productData = await getProductById(id);
        if (!productData) {
          setError('პროდუქტი ვერ მოიძებნა');
          return;
        }
        
        console.log('პროდუქტი ჩატვირთულია:', productData.name);
        setProduct(productData);
        
        // მხოლოდ საჯარო ფასდაკლების შემოწმება
        const hasPublicDiscount = productData.promoActive && 
          productData.hasPublicDiscount && 
          productData.discountPercentage;
          
        setIsPublicDiscount(!!hasPublicDiscount);
        
        if (hasPublicDiscount && productData.discountPercentage) {
          setDiscountedPrice(productData.price * (1 - (productData.discountPercentage / 100)));
        }
        
        // After fetching the product, fetch related products from the same category
        if (productData?.categoryId) {
          fetchRelatedProducts(productData.categoryId, productData.id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('პროდუქტის ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
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
      // თუ აქვს საჯარო ფასდაკლება, ვქმნით პროდუქტის ასლს შეცვლილი ფასით
      if (isPublicDiscount) {
        const discountedProduct = {
          ...product,
          originalPrice: product.price, // ორიგინალი ფასის შენახვა
          price: discountedPrice // დროებით შეცვლა ფასის კალათში, რომ იყოს ფასდაკლებით
        };
        
        for (let i = 0; i < quantity; i++) {
          addToCart(discountedProduct);
        }
      } else {
        // თუ არ აქვს ფასდაკლება, ჩვეულებრივად ვამატებთ
        for (let i = 0; i < quantity; i++) {
          addToCart(product);
        }
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

  // Memoized sorted related products for performance
  const sortedRelatedProducts = React.useMemo(() => {
    const sorted = [...relatedProducts];
    switch (relatedSortOption) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest': // If 'newest' means default fetched order, no sorting needed.
      default:
        return relatedProducts; // Avoid creating new array if no sort needed
    }
    return sorted;
  }, [relatedProducts, relatedSortOption]);

  // პრელოადი ძირითადი სურათის გადიდებისთვის
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      // წინასწარი ჩატვირთვა პირველი სურათის მოდალისთვის
      import('@/components/modals/zoomed-image-modal');
    }
  }, [product]);

  // დავამატოთ ფუნქცია მონათესავე პროდუქტებზე ნავიგაციისთვის
  const handleRelatedProductClick = (e: React.MouseEvent, relatedProductId: string) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProductId', relatedProductId);
      
      // ვიყენებთ სტატიკურ პროდუქტის გვერდს ყველა შემთხვევაში
      window.location.href = `${window.location.origin}/shop/static-product`;
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
  const hasMultipleImages = product.images && product.images.length > 1;
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : defaultImage;

  return (
    <ShopLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-2/5">
          {/* Main Image */}
          <div 
            className="relative aspect-square overflow-hidden rounded-md bg-white border cursor-pointer flex items-center justify-center max-h-[70vh]"
            onClick={toggleImageZoom}
          >
            {/* ფასდაკლების Badge */}
            {isPublicDiscount && (
              <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-2 py-1 rounded-md font-medium">
                {product.discountPercentage}% ფასდაკლება
              </div>
            )}
          
            <Image
              src={currentImage}
              alt={product.name}
              fill={true}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain"
              priority
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
            
            {/* Image Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                  aria-label="წინა სურათი"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                  aria-label="შემდეგი სურათი"
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
                  <Image 
                    src={image} 
                    alt={`${product.name} - სურათი ${index + 1}`} 
                    width={100}
                    height={100}
                    className="h-full w-full object-contain"
                    loading={index < 5 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-3/5">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-3">
            {isPublicDiscount ? (
              <div className="flex flex-col">
                <p className="text-lg line-through text-muted-foreground">
                  {new Intl.NumberFormat('ka-GE', {
                    style: 'currency',
                    currency: 'GEL',
                  }).format(product.price)}
                </p>
                <p className="text-2xl font-semibold text-red-600">
                  {new Intl.NumberFormat('ka-GE', {
                    style: 'currency',
                    currency: 'GEL',
                  }).format(discountedPrice)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ka-GE', {
                  style: 'currency',
                  currency: 'GEL',
                }).format(product.price)}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="description">აღწერა</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <div className="p-4 rounded-md border">
                  <p className="text-base text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="რაოდენობის შემცირება"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 tabular-nums">
                  {quantity}
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="რაოდენობის გაზრდა"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button onClick={handleAddToCart} className="flex-1" aria-label={`${product.name} - კალათში დამატება`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>კალათში დამატება</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-center sm:text-left w-full">იმავე კატეგორიის პროდუქტები</h2>
            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <Select value={relatedSortOption} onValueChange={(value) => setRelatedSortOption(value as SortOption)}>
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue placeholder="დახარისხება" />
                </SelectTrigger>
                <SelectContent className="after:content-[''] after:block after:h-3">
                  <SelectItem value="newest">უახლესი</SelectItem>
                  <SelectItem value="price-asc">ფასი: დაბლიდან მაღლა</SelectItem>
                  <SelectItem value="price-desc">ფასი: მაღლიდან დაბლა</SelectItem>
                  <SelectItem value="name-asc">სახელი: ა-ჰ</SelectItem>
                  <SelectItem value="name-desc">სახელი: ჰ-ა</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {sortedRelatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id}
                className="group cursor-pointer"
                onClick={(e) => handleRelatedProductClick(e, relatedProduct.id)}
              >
                <div className="aspect-square rounded-md overflow-hidden bg-white border mb-2 group-hover:shadow-md transition-all flex items-center justify-center">
                  {relatedProduct.images && relatedProduct.images[0] ? (
                    <Image
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamically import the Zoomed Image Modal */}
      {isImageZoomed && <ZoomedImageModal 
        currentImage={currentImage} 
        productName={product.name} 
        hasMultipleImages={hasMultipleImages} 
        onClose={toggleImageZoom} 
        onPrev={prevImage} 
        onNext={nextImage} 
      />}
    </ShopLayout>
  );
} 