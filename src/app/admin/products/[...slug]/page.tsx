import { getAllProducts } from '@/lib/firebase-service';

// დავამატოთ generateStaticParams ფუნქცია
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    // slug-ების მოწოდება დინამიური გვერდებისთვის
    return products.map(product => ({
      slug: [product.id], // ან უფრო რთული slug-ები საჭიროების შემთხვევაში
    }));
  } catch (error) {
    console.error('Error generating static params for product slug pages:', error);
    return [];
  }
}

// აქ თქვენი 'use client' და ძირითადი კოდი 