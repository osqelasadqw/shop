import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/providers/cart-provider';
import { Toaster } from 'sonner';

// Disable console logs in production
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
  console.error = function () {};
  console.warn = function () {};
}

// Add polyfill for ErrorEvent if it doesn't exist in the browser
const addErrorEventPolyfill = `
  if (typeof window !== 'undefined' && typeof ErrorEvent === 'undefined') {
    window.ErrorEvent = window.Event || function(type, options) {
      const event = document.createEvent('Event');
      event.initEvent(type, options?.bubbles || false, options?.cancelable || false);
      return event;
    };
  }
`;

// რესურსების ჩატვირთვის შეცდომების ჩახშობა
const handleRscErrorsScript = `
  if (typeof window !== 'undefined') {
    // RSC შეცდომების დამუშავება
    window.addEventListener('error', function(event) {
      if (event.filename && 
         (event.filename.includes('index.txt?_rsc=') || 
          event.filename.includes('/product/'))) {
        // შევაჩეროთ შეცდომა
        event.preventDefault();
        event.stopPropagation();
        console.log('RSC ფაილის ჩატვირთვის შეცდომა გაუქმებულია');
        return true;
      }
    }, true);

    // Fetch მოთხოვნების ჩახშობა
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
      // დავბლოკოთ RSC რესურსების მოთხოვნები
      if (resource && typeof resource === 'string') {
        // ვამოწმებთ არის თუ არა RSC მოთხოვნა
        if (resource.includes('index.txt?_rsc=')) {
          console.log('დაბლოკილი RSC მოთხოვნა:', resource);
          // დავაბრუნოთ ცარიელი პასუხი წარმატებული სტატუსით
          return Promise.resolve(new Response(JSON.stringify({ blocked: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        // თუ მომხმარებელი ცდილობს პროდუქტის გვერდზე გადასვლას, დავაფიქსიროთ
        if (resource.includes('/shop/product/') && !resource.includes('index.txt')) {
          console.log('პროდუქტის გვერდის მოთხოვნა:', resource);
        }
      }
      return originalFetch(resource, options);
    };
    
    // მარშრუტიზაციის ლოგიკა პროდუქტის გვერდებისთვის
    if (window.location.pathname.includes('/shop/product/') || 
        window.location.pathname.includes('/shop/shop/product/')) {
      console.log('პროდუქტის გვერდზე ვართ:', window.location.pathname);
      
      // წავიკითხოთ პროდუქტის ID - გამოვიყენოთ სტრინგის ძებნა ნაცვლად რეგულარული გამოსახულებისა
      const path = window.location.pathname;
      let productId = null;
      
      // ვიპოვოთ "product" სიტყვის ინდექსი
      const productKeyword = "product/";
      const productIndex = path.indexOf(productKeyword);
      
      if (productIndex !== -1) {
        // ამოვიღოთ ყველაფერი productKeyword-ის შემდეგ
        const afterKeyword = path.substring(productIndex + productKeyword.length);
        // თუ შეიცავს '/', მხოლოდ პირველ სეგმენტს ვიღებთ
        productId = afterKeyword.split('/')[0];
        
        console.log('პროდუქტის ID გამოტანილი:', productId);
        localStorage.setItem('currentProductId', productId);
      }
    }
  }
`;

// Add script to clean fdprocessedid attributes that cause hydration errors
const cleanFdProcessedIdScript = `
  if (typeof window !== 'undefined') {
    // მოუსმინოს DOM-ის ცვლილებებს და ავტომატურად წაშალოს fdprocessedid ატრიბუტები
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
          mutation.target.removeAttribute('fdprocessedid');
        }
        
        if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node && node.nodeType === 1) { // შემოწმება, რომ არის Element ტიპის
              try {
                // თავი ავარიდოთ Element-ად კასტინგს, მოვსინჯოთ უფრო უსაფრთხო მიდგომა
                if (node && typeof node === 'object') {
                  const elem = node;
                  // შევამოწმოთ ფუნქციების არსებობა პირდაპირ ობიექტზე
                  if (typeof elem.querySelectorAll === 'function') {
                    try {
                      const elements = elem.querySelectorAll('[fdprocessedid]');
                      if (elements && typeof elements.forEach === 'function') {
                        elements.forEach(el => {
                          if (el && typeof el.removeAttribute === 'function') {
                            el.removeAttribute('fdprocessedid');
                          }
                        });
                      }
                    } catch (err) {
                      // იგნორირება querySelectorAll შეცდომების
                    }
                  }
                  
                  // შევამოწმოთ hasAttribute და removeAttribute მეთოდები
                  if (elem && 
                      typeof elem.hasAttribute === 'function' && 
                      typeof elem.removeAttribute === 'function' && 
                      elem.hasAttribute('fdprocessedid')) {
                    elem.removeAttribute('fdprocessedid');
                  }
                }
              } catch (e) {
                // იგნორირება
              }
            }
          });
        }
      });
    });
    
    // გაწმენდა მაშინვე დატვირთვისას
    setTimeout(() => {
      try {
        document.querySelectorAll('[fdprocessedid]').forEach(el => {
          el.removeAttribute('fdprocessedid');
        });
        
        // დავიწყოთ მოვლენების მოსმენა
        observer.observe(document.body, { 
          attributes: true,
          attributeFilter: ['fdprocessedid'],
          childList: true,
          subtree: true
        });
      } catch (e) {
        console.error('Error initializing observer:', e);
      }
    }, 0);
  }
`;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnLyne Store - High Quality Products',
  description: 'Shop for high quality products at OnLyne Store',
  authors: [{ name: 'OnLyne Team' }],
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: addErrorEventPolyfill }} />
        <script dangerouslySetInnerHTML={{ __html: handleRscErrorsScript }} />
        <script dangerouslySetInnerHTML={{ __html: cleanFdProcessedIdScript }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
