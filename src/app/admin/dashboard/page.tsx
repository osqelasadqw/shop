'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getProducts, getCategories } from '@/lib/firebase-service';
import { Product, Category } from '@/types';
import { 
  Package2, 
  FolderTree,
  ArrowUpFromLine,
  Users
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const DashboardCard = ({ title, value, description, icon, className }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    className?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${className || 'bg-primary/10 text-primary'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store statistics and performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Products"
          value={products.length}
          description="Total products in your store"
          icon={<Package2 className="h-4 w-4" />}
          className="bg-blue-100 text-blue-600"
        />
        
        <DashboardCard
          title="Categories"
          value={categories.length}
          description="Total categories available"
          icon={<FolderTree className="h-4 w-4" />}
          className="bg-green-100 text-green-600"
        />
        
        <DashboardCard
          title="Uploads"
          value={products.reduce((total, product) => total + (product.images?.length || 0), 0)}
          description="Total images uploaded"
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          className="bg-amber-100 text-amber-600"
        />
        
        <DashboardCard
          title="Customers"
          value="Coming Soon"
          description="Customer management coming soon"
          icon={<Users className="h-4 w-4" />}
          className="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Recently added products in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">No products added yet.</p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <Package2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₾{product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              All product categories in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No categories added yet.</p>
            ) : (
              <div className="space-y-4">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <FolderTree className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {products.filter(p => p.categoryId === category.id).length} products
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 