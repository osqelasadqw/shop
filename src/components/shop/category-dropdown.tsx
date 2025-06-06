'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Category, Product } from '@/types';
import { getCategories, getProductsByCategory } from '@/lib/firebase-service';
import { ChevronDown, Pin } from 'lucide-react';

export function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const router = useRouter();
  const [closeTimerId, setCloseTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Cleanup timer on component unmount
    return () => {
      if (closeTimerId) {
        clearTimeout(closeTimerId);
      }
    };
  }, [closeTimerId]);

  const handleCategoryHover = async (categoryId: string) => {
    setHoveredCategory(categoryId);
    
    // If we already have products for this category, no need to fetch again
    if (categoryProducts[categoryId]) return;
    
    try {
      const products = await getProductsByCategory(categoryId);
      setCategoryProducts(prev => ({
        ...prev,
        [categoryId]: products
      }));
    } catch (error) {
      console.error('Error fetching products for category:', error);
    }
  };

  const clearCloseTimer = () => {
    if (closeTimerId) {
      clearTimeout(closeTimerId);
      setCloseTimerId(null);
    }
  };

  const handleMouseEnterButton = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const handleMouseLeaveButton = () => {
    if (isPinned) return; // არ დავხუროთ თუ დაფიქსირებულია
    
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 100); // 100ms delay before closing
    setCloseTimerId(timer);
  };
  
  const handleMouseEnterContent = () => {
    clearCloseTimer();
  };
  
  const handleMouseLeaveContent = () => {
    if (isPinned) return; // არ დავხუროთ თუ დაფიქსირებულია
    setIsOpen(false); // Close immediately when leaving content area
  };

  const handleButtonClick = () => {
    if (isOpen) {
      handleMouseLeaveContent(); // Close immediately if clicked while open
    } else {
      handleMouseEnterButton(); // Open immediately if clicked while closed
    }
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // შევაჩეროთ ივენთის გავრცელება
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (newPinnedState) {
      setIsOpen(true); // გავხსნათ, თუ ვაფიქსირებთ
    } else {
      setIsOpen(false); // დავხუროთ, თუ პინს მოვხსნით
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* დროფდაუნის ტრიგერი */}
      <div className="flex items-center">
        <button
          type="button"
          className={`inline-flex items-center justify-center mr-1 rounded-full w-5 h-5 ${isPinned ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} hover:bg-primary/90 hover:text-white transition-colors`}
          onClick={handlePinToggle}
          aria-label={isPinned ? "დააუფიქსირე კატეგორიები" : "გააუქმე კატეგორიების დაფიქსირება"}
        >
          <Pin className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          onClick={handleButtonClick}
          suppressHydrationWarning
        >
          კატეგორიები
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* დროფდაუნის კონტენტი */}
      {isOpen && (
        <div 
          className="fixed z-[100] top-[70px] left-1/2 -translate-x-1/2 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition-all animate-in fade-in-20 zoom-in-95 slide-in-from-top-1 duration-150"
          style={{ width: '1000px', height: '500px' }}
          onMouseEnter={handleMouseEnterContent}
          onMouseLeave={handleMouseLeaveContent}
        >
          <div className="flex divide-x h-full">
            {/* კატეგორიების სია */}
            <div className="w-72 py-2 h-full overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                    <span>იტვირთება...</span>
                  </div>
                </div>
              ) : categories.length > 0 ? (
                <div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                        hoveredCategory === category.id ? 'bg-gray-100 text-primary font-medium' : ''
                      }`}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onClick={() => {
                        router.push(`/shop?category=${category.id}`);
                        setIsOpen(false);
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">კატეგორიები არ მოიძებნა</div>
              )}
            </div>
            
            {/* პროდუქტების ფოტოები */}
            <div className="flex-1 p-4 h-full overflow-y-auto">
              {hoveredCategory ? (
                <div>
                  <h2 className="text-sm font-medium mb-3 border-b pb-2">
                    {categories.find(c => c.id === hoveredCategory)?.name}
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {categoryProducts[hoveredCategory]?.length > 0 ? (
                      categoryProducts[hoveredCategory].map(product => (
                        <Link 
                          href={`/shop/product/${product.id}`} 
                          key={product.id}
                          className="group"
                        >
                          <div className="aspect-square rounded-md overflow-hidden bg-gray-100 group-hover:shadow-md transition-all group-hover:scale-105 duration-200">
                            {product.images && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
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
                          <p className="mt-1 text-sm text-gray-700 truncate group-hover:text-primary transition-colors">{product.name}</p>
                          <p className="text-sm font-medium text-gray-900">₾{product.price?.toFixed(2)}</p>
                        </Link>
                      ))
                    ) : categoryProducts[hoveredCategory] ? (
                      <div className="col-span-3 text-center py-8 text-sm text-gray-500">
                        პროდუქტები არ მოიძებნა
                      </div>
                    ) : (
                      <div className="col-span-3 text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-500">იტვირთება...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  აირჩიეთ კატეგორია მარცხნივ
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 