'use client';

import React, { useEffect, useState } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { ProductCard } from '@/components/shop/product-card';
import { getProducts } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Filter, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from 'next/navigation';

type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc';

interface ShopPageProps {
  initialProducts: Product[];
  initialMinMaxPrice: [number, number];
}

// Fetch data at build time (or periodically with ISR)
// Note: In App Router, data fetching is done differently (Server Components)
// This example uses the older Pages Router style for illustration.
// A real App Router implementation would fetch data directly in the Server Component.
/*
export async function getStaticProps() {
  const productsData = await getProducts();
  let minMaxPrice: [number, number] = [0, 1000];
  if (productsData.length > 0) {
    const prices = productsData.map(p => p.price || 0);
    minMaxPrice = [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }
  return {
    props: {
      initialProducts: productsData,
      initialMinMaxPrice: minMaxPrice,
    },
    revalidate: 60, // Regenerate page every 60 seconds (ISR)
  };
}
*/

// For App Router, we fetch data directly in the component (Server Component)
// and pass it down or handle client-side state management.
// Let's simulate passing initial data via props and keep client-side filtering.

export default function ShopPage() { // We'll fetch data inside and keep client logic
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [initialMinMaxPrice, setInitialMinMaxPrice] = useState<[number, number]>([0, 1000]);
  const [isLoading, setIsLoading] = useState(true); // Keep loading state for client-side fetch
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // Update search term when URL param changes
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);
  
  // Fetch initial products on client side (App Router alternative to getStaticProps)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        
        let calculatedMinMax: [number, number] = [0, 1000];
        if (productsData.length > 0) {
          const prices = productsData.map(p => p.price || 0);
          calculatedMinMax = [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
        }
        setInitialMinMaxPrice(calculatedMinMax);
        setMinMaxPrice(calculatedMinMax);
        setPriceRange(calculatedMinMax); 
      } catch (error) {
        console.error('Error fetching initial products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []); // Fetch only once on mount

  // Filter products based on search term and filters (Client-side)
  const filteredProducts = products
    .filter(product => 
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (product.price >= priceRange[0] && product.price <= priceRange[1])
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleReset = () => {
    // Reset price range to initially fetched min/max
    setPriceRange(initialMinMaxPrice);
    setMinMaxPrice(initialMinMaxPrice);
    setSortOption('newest');
    setSearchTerm('');
    // We don't need to reset the search term URL parameter here, 
    // it should be handled by the search component in the layout
  };

  return (
    <ShopLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">ყველა პროდუქტი</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            დაათვალიერეთ ჩვენი მაღალი ხარისხის პროდუქტები
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <div className="md:w-64 lg:w-72">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ფილტრი</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  დააფილტრეთ და დაალაგეთ პროდუქტები
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range Slider */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">ფასი</h4>
                  <div className="pt-4">
                    <Slider
                      // Use initialMinMaxPrice for default, min, max
                      defaultValue={initialMinMaxPrice}
                      min={initialMinMaxPrice[0]}
                      max={initialMinMaxPrice[1]}
                      step={1}
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={handlePriceChange}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <div className="border rounded-md px-2 py-1 w-20 text-center">
                        {priceRange[0]} ₾
                      </div>
                      <div className="border rounded-md px-2 py-1 w-20 text-center">
                        {priceRange[1]} ₾
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sort Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">დახარისხება</h4>
                  <Select
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value as SortOption)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="აირჩიეთ ვარიანტი" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">უახლესი</SelectItem>
                      <SelectItem value="oldest">უძველესი</SelectItem>
                      <SelectItem value="price-asc">ფასი: დაბლიდან მაღლა</SelectItem>
                      <SelectItem value="price-desc">ფასი: მაღლიდან დაბლა</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleReset} variant="outline" className="w-full">
                  ფილტრის გასუფთავება
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(8)].map((_, index) => (
                // Skeleton Loader
                <div key={index} className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">პროდუქტები ვერ მოიძებნა</h2>
              <p className="text-muted-foreground">
                ვერ მოიძებნა პროდუქტი თქვენი პარამეტრებით.
                შეცვალეთ ფილტრაციის პარამეტრები ან გაასუფთავეთ ფილტრი.
              </p>
              <Button 
                className="mt-4"
                onClick={handleReset}
                variant="outline"
              >
                ფილტრის გასუფთავება
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
} 