import { getProductById, getAllProducts } from '@/lib/firebase-service';
import { cache } from 'react';
import ProductDetailClient from './client';

// გადავაკეშოთ შედეგი რომ არ მოხდეს მრავალჯერადი მოთხოვნა
const getProduct = cache(async (id: string) => {
  return await getProductById(id);
});

// დინამიური პარამეტრები
export const dynamicParams = true;

// დავამატოთ generateStaticParams რომ მოხდეს სტატიკური გვერდების გენერაცია
export async function generateStaticParams() {
  try {
    // ვცდილობთ ყველა პროდუქტის მიღებას
    const products = await getAllProducts();
    
    // თუ პროდუქტები ვერ ამოვიღეთ, დავაბრუნოთ ცარიელი მასივი
    if (!products) {
      console.log('პროდუქტები ვერ მოიძებნა სტატიკური გენერაციისთვის');
      return [{ id: 'placeholder' }];
    }
    
    // ვაბრუნებთ პროდუქტების ID-ების მასივს
    return products.map(product => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('შეცდომა generateStaticParams-ში:', error);
    // შეცდომის შემთხვევაში დავაბრუნოთ ცარიელი მასივი
    return [{ id: 'placeholder' }];
  }
}

// სერვერის მხარეს default ფუნქცია
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // პარამეტრების მიღება მარშრუტიდან
  const routeId = params.id;
  
  // კლიენტის კომპონენტის დაბრუნება ID-ის გადაცემით
  // შენიშვნა: localStorage-ის ამოღება ხდება კლიენტის კომპონენტში
  return <ProductDetailClient id={routeId} />;
} 