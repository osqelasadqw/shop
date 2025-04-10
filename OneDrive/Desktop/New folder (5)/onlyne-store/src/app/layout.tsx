import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/providers/cart-provider';

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
      </head>
      <body className={inter.className}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
