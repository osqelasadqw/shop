'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getProducts, getCategories, deleteProduct } from '@/lib/firebase-service';
import { Category, Product } from '@/types';
import { Plus, Edit, Trash2, ImageIcon, Search } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Map<string, Category>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      setProducts(productsData);
      
      // Create a map for faster category lookups
      const categoriesMap = new Map<string, Category>();
      categoriesData.forEach(category => {
        categoriesMap.set(category.id, category);
      });
      setCategories(categoriesMap);

      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(lowercasedTerm) || 
        product.description.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('ნამდვილად გსურთ პროდუქტის წაშლა?')) {
      try {
        setIsDeleting(true);
        await deleteProduct(id);
        // Update the products list
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('პროდუქტის წაშლა ვერ მოხერხდა.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.get(categoryId)?.name || 'Uncategorized';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">პროდუქტების მართვა</h1>
            <p className="text-muted-foreground mt-1">
              მართეთ თქვენი მაღაზიის პროდუქტები
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="mt-4 sm:mt-0"
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              პროდუქტის დამატება
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="პროდუქტების ძიება..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'პროდუქტები ვერ მოიძებნა.' : 'პროდუქტები არ არის დამატებული.'}
              </p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  ძიების გასუფთავება
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      პროდუქტი
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ფასი
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      კატეგორია
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      მოქმედებები
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-full object-contain bg-gray-100"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{formatCurrency(product.price)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{getCategoryName(product.categoryId ?? '')}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">რედაქტირება</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={isDeleting}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">წაშლა</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentProduct?.name}&quot;?
              This will also delete all associated images.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentProduct) {
                  handleDeleteProduct(currentProduct.id);
                }
                setIsDeleteDialogOpen(false);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 