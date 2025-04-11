'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from '@/components/shop/shopping-cart';
import { CategoryDropdown } from '@/components/shop/category-dropdown';
import { Category } from '@/types';
import { getCategories, getUserRole } from '@/lib/firebase-service';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useCart } from '@/components/providers/cart-provider';
import { auth } from '@/lib/firebase-config';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Input } from '@/components/ui/input';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export function ShopLayout({ children }: ShopLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
            <Link href="/shop" className="text-xl font-bold tracking-tight">
              OnLyne Store
            </Link>
              
              {/* Desktop Category Dropdown (visible on md and above) */}
              <div className="hidden md:block">
                <CategoryDropdown />
              </div>
            </div>
            
            {/* Center Search */}
            <div className="hidden md:flex flex-1 justify-center mx-4">
              <form onSubmit={handleSearch} className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="პროდუქტის ძიება..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu button (visible below md) */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
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
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="პროდუქტის ძიება..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-medium ${pathname === '/shop' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                ყველა პროდუქტი
              </Link>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">კატეგორიები</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-sm text-gray-500">იტვირთება...</div>
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
                    <div className="text-sm text-gray-500">კატეგორიები არ მოიძებნა</div>
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
      <footer className="bg-gray-800 text-gray-200 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">OnLyne Store</h3>
              <p className="text-gray-400 text-sm">
                თანამედროვე ონლაინ მაღაზია საქართველოში, სადაც შეგიძლიათ შეიძინოთ 
                მაღალი ხარისხის პროდუქცია სახლიდან გაუსვლელად.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">სწრაფი ბმულები</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-primary">მთავარი</Link>
                </li>
                <li>
                  <Link href="/shop/cart" className="text-gray-400 hover:text-primary">კალათა</Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary">შეკვეთის გაფორმება</Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary">ჩვენს შესახებ</Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary">კონტაქტი</Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-4">კონტაქტი</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>თბილისი, საქართველო</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@onlynestore.ge</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+995 555 123 456</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4">სიახლეები</h3>
              <p className="text-gray-400 text-sm mb-4">
                გამოიწერეთ ჩვენი სიახლეები, რათა პირველმა მიიღოთ ინფორმაცია აქციებისა და ახალი პროდუქტების შესახებ.
              </p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="თქვენი ელ-ფოსტა" 
                  className="rounded-l-md px-4 py-2 w-full text-gray-800 focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90"
                >
                  გამოწერა
                </button>
              </form>
            </div>
          </div>

          {/* Payment Methods and Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} OnLyne Store. ყველა უფლება დაცულია.
              </div>
              <div className="flex space-x-4">
                <img src="https://cdn-icons-png.flaticon.com/128/196/196578.png" alt="Visa" className="h-8 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/128/196/196561.png" alt="MasterCard" className="h-8 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/128/5968/5968299.png" alt="PayPal" className="h-8 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 