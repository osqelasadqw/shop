import { getAllProducts } from '@/lib/firebase-service';

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map(product => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params for shop pages:', error);
    return [];
  }
} 