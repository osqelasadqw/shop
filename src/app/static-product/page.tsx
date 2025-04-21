'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import Image from 'next/image';
import { getProductById, getProductsByCategory } from '@/lib/firebase-service';
import { Product, Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ShoppingCart, SlidersHorizontal, Plus, Minus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCart } from '@/components/providers/cart-provider';
import { ProductCard } from '@/components/shop/product-card';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
// Import Swiper and required modules
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function StaticProductPage() {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  // Filter states
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  const { addToCart } = useCart();
  const mainSwiperRef = useRef<SwiperRef>(null);
  const relatedSectionRef = useRef<HTMLDivElement>(null);

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
        
        // Fetch related products from the same category
        if (productData.categoryId) {
          fetchRelatedProducts(productData.categoryId, id);
        }
      }
    } catch (error) {
      console.error('პროდუქტის ჩატვირთვის შეცდომა:', error);
      setError('პროდუქტის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, currentId: string) => {
    try {
      const categoryProducts = await getProductsByCategory(categoryId);
      // Filter out the current product
      const filtered = categoryProducts.filter(p => p.id !== currentId);
      setRelatedProducts(filtered);
      setFilteredProducts(filtered);
      
      // Set price range based on products
      if (filtered.length > 0) {
        const prices = filtered.map(p => p.price || 0);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setPriceRange([min, max]);
        setMinPrice(min);
        setMaxPrice(max);
      }
    } catch (error) {
      console.error('მონათესავე პროდუქტების ჩატვირთვის შეცდომა:', error);
    }
  };

  // Apply filters to related products
  useEffect(() => {
    if (!relatedProducts.length) return;
    
    let filtered = [...relatedProducts];
    
    // Apply price filter
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      // 'newest' is default and already sorted
    }
    
    setFilteredProducts(filtered);
  }, [relatedProducts, priceRange, sortOption]);
  
  // Adjust scroll effect for the full-page filter
  useEffect(() => {
    const handleScroll = () => {
      const floatingFilter = document.getElementById('floating-filter');
      if (!floatingFilter) return;
      
      const scrollY = window.scrollY;
      const headerHeight = 80; // Approximate header height
      
      if (scrollY > headerHeight) {
        floatingFilter.style.position = 'fixed';
        floatingFilter.style.top = '80px';
      } else {
        floatingFilter.style.position = 'absolute';
        floatingFilter.style.top = `${headerHeight + 8}px`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial positioning
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Reset filters function
  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSortOption('newest');
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (product) {
      // Check if product has a public discount
      const hasActiveDiscount = product.promoActive && 
        product.discountPercentage && 
        product.hasPublicDiscount;
        
      const discountedPrice = hasActiveDiscount
        ? product.price * (1 - (product.discountPercentage || 0) / 100)
        : product.price;
        
      // If there's a discount, create a product copy with adjusted price
      if (hasActiveDiscount) {
        const discountedProduct = {
          ...product,
          originalPrice: product.price,
          price: discountedPrice
        };
        
        for (let i = 0; i < quantity; i++) {
          addToCart(discountedProduct);
        }
      } else {
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

  // ვამზადებთ უკან დასაბრუნებელ URL-ს
  const backToShopUrl = typeof window !== 'undefined' && window.location.origin.includes('github.io')
    ? '/shop/'
    : '/shop';

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowModal(true);
    // Prevent scrolling while modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeImageModal = () => {
    setShowModal(false);
    // Re-enable scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Make sure to reset body style if component unmounts
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [showModal]);

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="w-full lg:w-1/2">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-1/3 mt-12 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-md" />
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
  const hasImages = product.images && product.images.length > 0;
  
  // Check if product has a public discount
  const hasActiveDiscount = product.promoActive && 
    product.discountPercentage && 
    product.hasPublicDiscount;
    
  const discountedPrice = hasActiveDiscount
    ? product.price * (1 - (product.discountPercentage || 0) / 100)
    : null;

  return (
    <ShopLayout>
      {/* Fixed Filter Button for Mobile */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setShowMobileFilter(true)}
          className="rounded-full shadow-md h-12 w-12 p-0 flex items-center justify-center"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main layout with static sidebar */}
      <div className="flex flex-col md:flex-row max-w-[100vw]">
        {/* Static sidebar for filter - hidden on mobile */}
        <div className="hidden md:block w-[200px] bg-transparent min-h-screen flex-shrink-0">
          <div className="sticky top-[88px] p-4">
            <div className="bg-white border rounded-lg p-4 shadow-sm w-full">
              <h3 className="font-medium mb-4 text-center">ფილტრი</h3>
              
              {/* Sort Dropdown */}
              <div className="mb-6">
                <label className="block text-sm mb-2">დახარისხება</label>
                <Select 
                  value={sortOption} 
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="დახარისხება" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">უახლესი</SelectItem>
                    <SelectItem value="price-asc">ფასი: დაბლიდან</SelectItem>
                    <SelectItem value="price-desc">ფასი: მაღლიდან</SelectItem>
                    <SelectItem value="name-asc">სახელი: ა-ჰ</SelectItem>
                    <SelectItem value="name-desc">სახელი: ჰ-ა</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range Slider */}
              <div className="mb-4">
                <label className="block text-sm mb-2">ფასის დიაპაზონი</label>
                <Slider
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₾{priceRange[0]}</span>
                  <span>₾{priceRange[1]}</span>
                </div>
              </div>
              
              {/* Reset Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={resetFilters}
              >
                გასუფთავება
              </Button>
              
              {/* Products count */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                ნაპოვნია {filteredProducts.length} პროდუქტი
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto px-2 sm:px-4 py-8">
            {/* Main Product Section - Force row layout on all screens */}
            <div className="flex flex-row gap-4 mb-10 overflow-hidden">
              {/* Left Side - Product Image - Fixed width */}
              <div className="w-[40%] min-w-[40%] flex-shrink-0 flex flex-col min-w-0 items-center"> 
                {/* Main Swiper for Images - Fixed height */}
                <div className="w-full mx-auto aspect-square h-auto max-h-[250px] relative rounded-md overflow-hidden">
              {hasImages ? (
                <>
                  <Swiper
                    ref={mainSwiperRef}
                    style={{ width: '100%', height: '100%' }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    navigation={{
                      prevEl: '.swiper-button-prev',
                      nextEl: '.swiper-button-next',
                    }}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    className="product-swiper"
                    onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                  >
                    {product.images.map((image, index) => (
                          <SwiperSlide key={index} className="flex items-center justify-center bg-gray-50">
                        <div className="relative h-full w-full cursor-pointer" onClick={() => openImageModal(index)}>
                          <Image
                            src={image}
                            alt={`${product.name} - სურათი ${index + 1}`}
                            fill
                            className="object-contain"
                            priority={index === 0}
                                sizes="(max-width: 1024px) 40vw, 250px"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                      {/* Navigation Buttons - Smaller on mobile */}
                  {hasMultipleImages && (
                    <>
                          <button className="swiper-button-prev absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-1 rounded-full shadow hover:bg-opacity-100 transition-all z-10 flex items-center justify-center">
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                          <button className="swiper-button-next absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-1 rounded-full shadow hover:bg-opacity-100 transition-all z-10 flex items-center justify-center">
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </>
                  )}

                      {/* Discount Badge - Smaller on mobile */}
                  {hasActiveDiscount && (
                        <div className="absolute top-1 right-1 z-10 bg-red-500 text-white px-1 py-0.5 rounded-md text-xs font-medium">
                          {product.discountPercentage}%
                    </div>
                  )}
                </>
              ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 aspect-square">
                  <p className="text-gray-400">სურათი არ არის</p>
                </div>
              )}
            </div>
            
                {/* Thumbnail Swiper - Centered with margin-left */}
            {hasMultipleImages && (
                  <div className="mt-2 w-[90%] mx-auto h-[40px] hidden sm:block">
                <Swiper
                  onSwiper={setThumbsSwiper}
                      spaceBetween={8}
                  slidesPerView="auto"
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                      className="thumbnails-swiper h-full flex justify-center"
                      centeredSlides={true}
                >
                  {product.images.map((image, index) => (
                        <SwiperSlide key={index} className="cursor-pointer !w-[40px] h-full">
                      <div className={`border-2 rounded-md overflow-hidden h-full ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}>
                        <div className="relative h-full w-full">
                          <Image
                            src={image}
                            alt={`მინიატურა ${index + 1}`}
                            fill
                            className="object-contain"
                                sizes="40px"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
              </div>

              {/* Right Side - Product Details - Set to fill remaining space */}
              <div className="w-[60%] min-w-0 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  {/* Title - Smaller on mobile, with ellipsis */}
                  <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold overflow-hidden text-ellipsis whitespace-nowrap mr-2">{product.name}</h1>
                  {/* Back button - Shown only on larger screens */}
                  <Link href={backToShopUrl} className="hidden sm:block">
                    <Button variant="outline" size="sm" className="flex-shrink-0">უკან</Button>
                  </Link>
        </div>

                {/* Price - Smaller on mobile */}
                <div className="mb-2 sm:mb-4">
                  {hasActiveDiscount ? (
                    <div className="flex flex-col">
                      <p className="text-xs sm:text-sm line-through text-muted-foreground">
                        {new Intl.NumberFormat('ka-GE', {
                          style: 'currency',
                          currency: 'GEL',
                          maximumFractionDigits: 0
                        }).format(product.price)}
                      </p>
                      <p className="text-sm sm:text-lg font-semibold text-red-600">
                        {new Intl.NumberFormat('ka-GE', {
                          style: 'currency',
                          currency: 'GEL',
                          maximumFractionDigits: 0
                        }).format(discountedPrice || 0)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-lg font-semibold">
                      {new Intl.NumberFormat('ka-GE', {
                        style: 'currency',
                        currency: 'GEL',
                        maximumFractionDigits: 0
                      }).format(product.price)}
                    </p>
                  )}
            </div>
            
                {/* Description - Smaller height on mobile */}
                <div className="mb-2 sm:mb-4">
                  <h2 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">აღწერა</h2>
                  <div className="p-1 sm:p-2 rounded-md border bg-white max-h-[60px] sm:max-h-[120px] overflow-y-auto text-xs sm:text-sm">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {product.description || "პროდუქტს არ აქვს დეტალური აღწერა."}
                    </p>
              </div>
            </div>
            
                {/* Add to Cart Section - Vertical on all screens */}
                <div className="flex flex-col items-stretch gap-1 sm:gap-2 mt-auto">
                  <div className="flex items-center justify-between border rounded-md flex-shrink-0 h-8 sm:h-10">
                    <button
                      type="button"
                      className="p-1 sm:p-2 hover:bg-gray-100"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="რაოდენობის შემცირება"
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <div className="px-2 sm:px-4 py-1 tabular-nums text-xs sm:text-sm">
                      {quantity}
          </div>
                    <button
                      type="button"
                      className="p-1 sm:p-2 hover:bg-gray-100"
                      onClick={() => handleQuantityChange(1)}
                      aria-label="რაოდენობის გაზრდა"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
        </div>

                <Button 
                    onClick={handleAddToCart} 
                    className="h-8 sm:h-10 text-xs sm:text-sm" 
                    aria-label={`${product.name} - კალათში დამატება`}
                  >
                    <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">კალათში</span>
                </Button>
                </div>
              </div>
            </div>
            
            {/* Back Link shown only on small screens, centered */}
            <div className="flex justify-center mb-6 sm:hidden">
              <Link href={backToShopUrl}>
                <Button variant="outline" size="sm">უკან დაბრუნება</Button>
              </Link>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-16 relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold ml-8 sm:ml-16 md:ml-24 lg:ml-32">მსგავსი პროდუქტები</h2>
                </div>
                
                <div> 
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 mx-auto" style={{ maxWidth: '1200px' }}>
                      {/* Use different slices based on screen size with CSS */}
                      {filteredProducts.slice(0, 25).map((relatedProduct, index) => (
                        <div 
                          key={relatedProduct.id} 
                          className={`transform scale-[0.85] sm:scale-[0.9] md:scale-95 lg:scale-100 origin-top-left
                            ${index >= 9 ? 'hidden lg:block' : ''} 
                            ${index >= 16 ? 'hidden xl:block' : ''}`}
                        >
                    <ProductCard 
                      product={relatedProduct}
                    />
                        </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">ფილტრის კრიტერიუმებით პროდუქტები ვერ მოიძებნა</p>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
      
      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[110] overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/30" 
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">ფილტრი</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMobileFilter(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="mb-6">
              <label className="block text-sm mb-2">დახარისხება</label>
              <Select 
                value={sortOption} 
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="დახარისხება" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">უახლესი</SelectItem>
                  <SelectItem value="price-asc">ფასი: დაბლიდან</SelectItem>
                  <SelectItem value="price-desc">ფასი: მაღლიდან</SelectItem>
                  <SelectItem value="name-asc">სახელი: ა-ჰ</SelectItem>
                  <SelectItem value="name-desc">სახელი: ჰ-ა</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range Slider */}
            <div className="mb-6">
              <label className="block text-sm mb-2">ფასის დიაპაზონი</label>
              <Slider
                min={minPrice}
                max={maxPrice}
                step={1}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₾{priceRange[0]}</span>
                <span>₾{priceRange[1]}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetFilters}
              >
                გასუფთავება
              </Button>
              
              <Button 
                className="flex-1"
                onClick={() => setShowMobileFilter(false)}
              >
                პროდუქტების ნახვა ({filteredProducts.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showModal && hasImages && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/50 p-2 sm:p-4" onClick={closeImageModal}>
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-md"
            onClick={closeImageModal}
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Thumbnails container (desktop) */}
          {hasMultipleImages && (
            <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 flex-col space-y-2 z-50" onClick={(e) => e.stopPropagation()}>
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer border-2 rounded-md overflow-hidden h-[70px] w-[70px] bg-white shadow-md ${
                    index === modalImageIndex ? 'border-blue-500' : 'border-white'
                  }`}
                  onClick={() => setModalImageIndex(index)}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt={`მინიატურა ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="70px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Main Image Container (no background) */}
          <div className="max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[85vh] w-[85vw] md:w-[70vw]">
              <Image
                src={product.images[modalImageIndex] || defaultImage}
                alt={`${product.name} - სურათი ${modalImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 85vw, 70vw"
              />
              
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Thumbnails at the bottom (mobile) */}
          {hasMultipleImages && (
            <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white bg-opacity-90 p-2 rounded-lg shadow-md z-50" onClick={(e) => e.stopPropagation()}>
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer flex-shrink-0 border-2 rounded-md overflow-hidden h-[50px] w-[50px] ${
                    index === modalImageIndex ? 'border-blue-500' : 'border-white'
                  }`}
                  onClick={() => setModalImageIndex(index)}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt={`მინიატურა ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="50px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ShopLayout>
  );
} 