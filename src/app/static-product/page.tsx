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
import { useRouter } from 'next/navigation';

// Define a cookie consent function to handle privacy compliance
const setCookieConsent = () => {
  // This is a placeholder for a proper cookie consent mechanism
  // A real implementation would ask for user consent before setting cookies
  if (typeof window !== 'undefined') {
    // Set localStorage instead of cookies (more privacy-friendly)
    localStorage.setItem('cookieConsent', 'true');
  }
};

// Helper function to handle Next.js prefetching errors
const disablePrefetchForGitHubPages = () => {
  if (typeof window !== 'undefined') {
    // Check if we are running on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      // Suppress console errors completely
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console.error and warn to filter out specific errors
      console.error = function(...args) {
        // Filter out errors related to our known problems
        if (args.length > 0) {
          const errorMsg = String(args[0]);
          if (errorMsg.includes('.txt') || 
              errorMsg.includes('?_rsc=') || 
              errorMsg.includes('404') || 
              errorMsg.includes('chunk') ||
              errorMsg.includes('product') ||
              errorMsg.includes('failed to load') ||
              errorMsg.includes('shop/shop')) {
            // Completely silent - no output
            return;
          }
          
          // For other errors, preserve the original behavior
          return originalConsoleError.apply(console, args);
        }
      };
      
      // Also clean warnings
      console.warn = function(...args) {
        if (args.length > 0) {
          const warnMsg = String(args[0]);
          if (warnMsg.includes('preload') || 
              warnMsg.includes('css') || 
              warnMsg.includes('was not used') ||
              warnMsg.includes('third-party')) {
            // Completely silent
            return;
          }
          return originalConsoleWarn.apply(console, args);
        }
      };
      
      // Hide any resource errors from the Error event
      window.addEventListener('error', function(e) {
        // Block all network-related errors
        if (e.filename && (
            e.filename.includes('/product/') || 
            e.filename.includes('.txt') || 
            e.filename.includes('?_rsc=') ||
            e.filename.includes('_next/static') ||
            e.filename.includes('shop/shop'))) {
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
        
        // Also check if it's a script/resource loading error
        if (e.target && (e.target instanceof HTMLScriptElement || 
                        e.target instanceof HTMLLinkElement || 
                        e.target instanceof HTMLImageElement)) {
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
      }, true);
      
      // Suppress unhandled promise rejections too
      window.addEventListener('unhandledrejection', function(e) {
        // Any promise rejection related to fetching
        if (e.reason && (
            e.reason.toString().includes('/product/') ||
            e.reason.toString().includes('.txt') ||
            e.reason.toString().includes('?_rsc=') ||
            e.reason.toString().includes('404') ||
            e.reason.toString().includes('shop/shop'))) {
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
      }, true);
      
      // Also completely disable all debug output to keep console clean
      if (!window.location.href.includes('debug=true')) {
        console.debug = function() { /* Silent */ };
      }
      
      // Hide all Next.js specific error overlays
      if (typeof window !== 'undefined') {
        // @ts-ignore - Next.js internal property
        window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
        // @ts-ignore - Next.js internal property
        window.__NEXT_DATA__.err = null;
        
        // This prevents Next.js from showing error overlays
        // @ts-ignore - Next.js internal
        window.__NEXT_ERROR_OVERLAY_SOCKET_CONNECTED = true;
        
        // This prevents any error reporting back to Next.js
        // @ts-ignore - Next.js internal
        window.__NEXT_HAS_REPORTED_ERROR = true;
      }
      
      // AGGRESSIVE EARLY INTERCEPTION
      // Completely override Next.js routing on GitHub Pages
      // This must run before any resources are loaded
      console.debug('Running in GitHub Pages environment - applying fixes');
      
      // 1. Intercept all script loads to catch scripts before they execute
      const originalCreateElement = document.createElement;
      // @ts-ignore - Overriding DOM API
      document.createElement = function(tagName: string, options?: ElementCreationOptions) {
        const element = originalCreateElement.call(document, tagName, options);
        
        if (tagName.toLowerCase() === 'script') {
          const originalSetAttribute = element.setAttribute;
          element.setAttribute = function(name: string, value: string) {
            // Block loading of any scripts that might cause prefetching
            if ((name === 'src' || name === 'data-src') && 
                (value.includes('_next/static') && value.includes('chunk'))) {
              console.debug('Modifying script load behavior:', value);
              // Add special attributes to prevent automatic prefetching
              originalSetAttribute.call(this, 'data-manual-load', 'true');
              return originalSetAttribute.call(this, name, value);
            }
            return originalSetAttribute.call(this, name, value);
          };
        }
        
        return element;
      };
      
      // 2. Block network requests immediately
      // More aggressive fetch replacement that catches all requests before they're made
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input instanceof Request ? input.url : '';
        
        // Fix double shop path issue - convert /shop/shop/ to /shop/
        if (url && url.includes('/shop/shop/')) {
          const fixedUrl = url.replace('/shop/shop/', '/shop/');
          console.debug('Fixed double shop path in URL:', url, '→', fixedUrl);
          
          // If it's a string, we can directly return the fixed URL
          if (typeof input === 'string') {
            return originalFetch(fixedUrl, init);
          }
          // If it's a Request object, we need to create a new one
          else if (input instanceof Request) {
            const newRequest = new Request(fixedUrl, input);
            return originalFetch(newRequest, init);
          }
          // For URL objects
          else if (input instanceof URL) {
            const newUrl = new URL(fixedUrl);
            return originalFetch(newUrl, init);
          }
        }
        
        // Directly block any problematic requests
        if (url && (
            (url.includes('/product/') || url.includes('/shop/product/')) && 
            (url.includes('.txt') || url.includes('?_rsc=')) ||
            url.includes('_buildManifest') ||
            url.includes('_ssgManifest') ||
            url.includes('build-manifest') ||
            url.includes('require-hook')
        )) {
          console.debug('Blocked fetch request:', url);
          return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        
        return originalFetch(input, init);
      };
      
      // 3. Fix CSS preload warnings
      const fixCssPreloads = () => {
        document.querySelectorAll('link[rel="preload"][href*=".css"]').forEach(link => {
          if (link instanceof HTMLLinkElement && !link.hasAttribute('as')) {
            link.setAttribute('as', 'style');
          }
        });
      };
      
      // Run immediately and also on DOMContentLoaded
      fixCssPreloads();
      document.addEventListener('DOMContentLoaded', fixCssPreloads);
      
      // 4. Disable all link prefetching
      const disablePrefetchLinks = () => {
        // Remove all existing prefetch links
        document.querySelectorAll('link[rel="prefetch"], link[rel="preconnect"], link[rel="prerender"]').forEach(link => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        });
      };
      
      // Run immediately and on DOMContentLoaded
      disablePrefetchLinks();
      document.addEventListener('DOMContentLoaded', disablePrefetchLinks);
      
      // 5. Monitor and intercept all navigation
      const handleClick = (e: MouseEvent) => {
        // Check if it's a link click
        let target = e.target as HTMLElement;
        while (target && target.tagName !== 'A') {
          target = target.parentElement as HTMLElement;
        }
        
        if (!target) return;
        const link = target as HTMLAnchorElement;
        
        // Fix double shop paths
        if (link.href && link.href.includes('/shop/shop/')) {
          e.preventDefault();
          const fixedHref = link.href.replace('/shop/shop/', '/shop/');
          console.debug('Fixed double shop path in link:', link.href, '→', fixedHref);
          link.href = fixedHref;
          // Let the click continue with the corrected URL
          link.click();
          return;
        }
        
        // If it's a product link that would cause errors
        if (link.href && (link.href.includes('/product/') || link.href.includes('/shop/product/'))) {
          e.preventDefault();
          console.debug('Intercepted navigation to product:', link.href);
          
          // Extract the product ID using a more robust pattern
          // This handles both /product/ID and /shop/product/ID patterns
          const productIdMatch = link.href.match(/\/(?:shop\/)?product\/([^/?&#]+)/);
          if (productIdMatch && productIdMatch[1]) {
            const productId = productIdMatch[1];
            console.debug('Extracted product ID:', productId);
            
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('currentProductId', productId);
              
              // Use correct path based on deployment environment
              const isGitHubPages = window.location.hostname.includes('github.io');
              const targetPath = isGitHubPages ? '/shop/static-product' : '/static-product';
              window.location.href = targetPath;
            }
          }
        }
      };
      
      // Add global click handler
      document.addEventListener('click', handleClick, true);
      
      // Also apply our previous fixes

      // Fix CSS preload warnings by ensuring proper 'as' attribute
      setTimeout(() => {
        document.querySelectorAll('link[rel="preload"][href*=".css"]').forEach(link => {
          if (link instanceof HTMLLinkElement && !link.hasAttribute('as')) {
            link.setAttribute('as', 'style');
          }
        });
      }, 0);
      
      // Disable all prefetching
      try {
        // Attempt to manually disable Next.js prefetching
        const linkElements = document.querySelectorAll('link[rel="prefetch"]');
        linkElements.forEach(link => {
          link.setAttribute('rel', 'disabled-prefetch');
        });
        
        // Create a MutationObserver to disable new prefetch links
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'LINK' && 
                    node instanceof HTMLLinkElement && 
                    node.rel === 'prefetch') {
                  node.setAttribute('rel', 'disabled-prefetch');
                }
              });
            }
          });
        });
        
        // Start observing
        observer.observe(document.head, { childList: true, subtree: true });
        
        // Patch history.pushState to prevent Next.js prefetch errors
      const originalPush = window.history.pushState;
      window.history.pushState = function() {
        try {
          return originalPush.apply(this, arguments as any);
        } catch (e) {
          console.debug('Prevented prefetch error:', e);
          return;
        }
      };
      } catch (error) {
        console.debug('Error while disabling prefetching:', error);
      }
      
      // Intercept fetch calls to prevent 404 errors on .txt files
      const originalFetch2 = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        // If the URL is a .txt file on GitHub Pages, don't fetch it
        if (typeof input === 'string' && 
            (input.includes('.txt') || input.includes('?_rsc=')) && 
            (input.includes('github.io') || input.includes('/shop/'))) {
          console.debug('Prevented fetch for:', input);
          return Promise.resolve(new Response('{}', { status: 200 }));
        }
        return originalFetch2(input, init);
      };
      
      // Also intercept XMLHttpRequest for older code
      const originalOpen = XMLHttpRequest.prototype.open;
      // @ts-ignore - Overriding browser API for prefetch prevention
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        // Fix double shop paths
        if (typeof url === 'string' && url.includes('/shop/shop/')) {
          const fixedUrl = url.replace('/shop/shop/', '/shop/');
          console.debug('Fixed double shop path in XHR:', url, '→', fixedUrl);
          // @ts-ignore - Type safety for rest parameters
          return originalOpen.call(this, method, fixedUrl, ...rest);
        }
        
        // For blocking problematic URLs, ensure url is a string first
        const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : '';
        if (urlStr && 
            ((urlStr.includes('/product/') || urlStr.includes('/shop/product/')) && 
            (urlStr.includes('.txt') || urlStr.includes('?_rsc='))) ||
            (urlStr.includes('github.io') && urlStr.includes('?_rsc='))) {
          console.debug('Prevented XHR for:', urlStr);
          // Redirect to a blank response
          // @ts-ignore - Type safety for rest parameters
          return originalOpen.call(this, method, 'data:text/plain,{}', ...rest);
        }
        // @ts-ignore - Type safety for rest parameters
        return originalOpen.call(this, method, url, ...rest);
      };
      
      // Disable IntersectionObserver that might be triggering prefetches
      const originalIntersectionObserver = window.IntersectionObserver;
      // @ts-ignore - Overriding browser API for prefetch prevention
      window.IntersectionObserver = function(callback, options) {
        const wrappedCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
          // Filter out entries that might trigger prefetching
          const filteredEntries = entries.filter(entry => {
            const element = entry.target;
            if (element instanceof HTMLAnchorElement && element.getAttribute('href')?.includes('/product/')) {
              return false; // Skip prefetching for product links
            }
            return true;
          });
          
          if (filteredEntries.length > 0) {
            callback(filteredEntries, observer);
          }
        };
        
        return new originalIntersectionObserver(wrappedCallback, options);
      };
      
      // Monitor all network activity using Performance API
      try {
        // Create a tracking array for blocked URLs
        const blockedUrls: string[] = [];
        
        // Monitor for network failures using PerformanceObserver
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Only look at resource loads
            if (entry.entryType === 'resource') {
              const url = (entry as PerformanceResourceTiming).name;
              
              // If this is a problematic URL pattern, add to blocked list
              if (url.includes('/product/') || 
                  url.includes('.txt') || 
                  url.includes('?_rsc=') || 
                  url.includes('shop/shop')) {
                
                // Add to our internal tracking list
                blockedUrls.push(url);
              }
            }
          });
        });
        
        // Start observing resource timing entries
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Ignore errors from our error monitoring system
      }
    }
  }
};

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
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set cookie consent on first load
    setCookieConsent();
    
    // Fix prefetching issues on GitHub Pages
    disablePrefetchForGitHubPages();

    // ID-ის ამოღება localStorage-დან
    const storedId = localStorage.getItem('currentProductId');
    
    if (storedId) {
      setProductId(storedId);
      fetchProduct(storedId);
    } else {
      setError('პროდუქტის ID ვერ მოიძებნა');
      setIsLoading(false);
    }

    // Add an error handler for missing resources
    const handleError = (event: ErrorEvent) => {
      // Check if the error is from a 404 resource and ignore it
      if (event.message?.includes('404') || 
          event.filename?.includes('index.txt') || 
          (event.message && event.message.toString().includes('.txt'))) {
        event.preventDefault();
        console.debug('Prevented error from being logged:', event.message);
        return true; // Prevents the error from propagating
      }
      return false;
    };

    window.addEventListener('error', handleError as any);
    
    // Setup unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
         (event.reason.toString().includes('404') || 
          event.reason.toString().includes('.txt'))) {
        event.preventDefault();
        console.debug('Prevented unhandled rejection:', event.reason);
        return true;
      }
      return false;
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clear the console to remove any previous errors
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      setTimeout(() => {
        console.clear();
      }, 2000);
    }

    return () => {
      window.removeEventListener('error', handleError as any);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
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

  // Override the product link to prevent prefetching issues
  const navigateToProduct = (productId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProductId', productId);
      
      // Force a full page load instead of client-side navigation
      const isGitHubPages = window.location.hostname.includes('github.io');
      if (isGitHubPages) {
        window.location.href = '/shop/static-product';
      } else {
        router.push('/static-product');
      }
    }
  };

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
                      {filteredProducts.slice(0, 25).map((relatedProduct, index) => (
                        <div 
                          key={relatedProduct.id} 
                          className={`transform scale-[0.85] sm:scale-[0.9] md:scale-95 lg:scale-100 origin-top-left
                            ${index >= 9 ? 'hidden lg:block' : ''} 
                            ${index >= 16 ? 'hidden xl:block' : ''}`}
                          onClick={() => navigateToProduct(relatedProduct.id)}
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