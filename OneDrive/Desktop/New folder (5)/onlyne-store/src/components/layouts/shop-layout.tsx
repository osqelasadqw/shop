'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from '@/components/shop/shopping-cart';
import { Category } from '@/types';
import { getCategories, getUserRole } from '@/lib/firebase-service';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/components/providers/cart-provider';
import { auth } from '@/lib/firebase-config';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export function ShopLayout({ children }: ShopLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Check if user is admin in Firestore
      if (currentUser && currentUser.email) {
        try {
          const { isAdmin: hasAdminRole } = await getUserRole(currentUser.email);
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/shop" className="text-xl font-bold tracking-tight">
              OnLyne Store
            </Link>
            
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {user.photoURL && (
                          <img 
                            src={user.photoURL} 
                            alt="User profile" 
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium hidden md:inline-block">
                          {user.displayName}
                        </span>
                      </div>
                      
                      {isAdmin && (
                        <Link 
                          href="/admin"
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label="Admin panel"
                        >
                          <LayoutDashboard size={20} />
                        </Link>
                      )}
                      
                      <button 
                        onClick={handleSignOut}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        aria-label="Sign out"
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSignIn}
                      className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} />
                      <span>Google-ით ავტორიზაცია</span>
                    </button>
                  )}
                </>
              )}
              
              <Link href="/shop/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-medium ${pathname === '/shop' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                All Products
              </Link>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/shop/category/${category.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm text-muted-foreground hover:text-primary"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No categories found</div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} OnLyne Store. ყველა უფლება დაცულია.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 