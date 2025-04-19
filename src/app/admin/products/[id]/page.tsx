import { ProductEditClient } from './product-edit-client';
import { getAllProducts } from '@/lib/firebase-service';

// დავამატოთ generateStaticParams ფუნქცია static export-ისთვის
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map(product => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params for product pages:', error);
    return [];
  }
}

export default function ProductEditPage({ params }: { params: { id: string } }) {
  return <ProductEditClient id={params.id} />;
} 