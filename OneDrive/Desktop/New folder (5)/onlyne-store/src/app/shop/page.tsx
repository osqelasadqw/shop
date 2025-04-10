'use client';

import React, { useEffect, useState } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { ProductCard } from '@/components/shop/product-card';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/firebase-service';
import { Product } from '@/types';
import { Search, Filter } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ShopLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">All Products</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Browse our collection of high-quality products
          </p>
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {[...Array(8)].map((_, index) => (
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
          {searchTerm ? (
            <>
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-muted-foreground">
                No products match your search &quot;{searchTerm}&quot;.
                Try a different search term or browse all products.
              </p>
              <button 
                className="mt-4 text-primary hover:underline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium mb-2">No products available</h2>
              <p className="text-muted-foreground">
                Check back soon for new products.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </ShopLayout>
  );
} 