import { getAllProducts } from '@/lib/firebase-service';

// დავამატოთ generateStaticParams ფუნქცია
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map(product => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params for product edit pages:', error);
    return [];
  }
}

// აქ თქვენი 'use client' და ძირითადი კოდი 