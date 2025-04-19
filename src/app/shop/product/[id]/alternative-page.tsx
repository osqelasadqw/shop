import { getProductById } from '@/lib/firebase-service';
import { cache } from 'react';
import ProductDetailClient from './client';

// გადავაკეშოთ შედეგი რომ არ მოხდეს მრავალჯერადი მოთხოვნა
const getProduct = cache(async (id: string) => {
  return await getProductById(id);
});

// მოვნიშნოთ, რომ ყველა პარამეტრი დასაშვებია
export const dynamicParams = true;

// სერვერის მხარეს default ფუნქცია
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // პროდუქტის ID-ის მიღება params-დან
  const { id } = params;
  
  // კლიენტის კომპონენტის დაბრუნება ID-ის გადაცემით
  return <ProductDetailClient id={id} />;
} 