import { getProductById } from '@/lib/firebase-service';
import { cache } from 'react';
import ProductDetailClient from './client';

// გადავაკეშოთ შედეგი რომ არ მოხდეს მრავალჯერადი მოთხოვნა
const getProduct = cache(async (id: string) => {
  return await getProductById(id);
});

// სტატიკური მარშრუტების გენერაცია 404 შეცდომების თავიდან ასაცილებლად
export async function generateStaticParams() {
  // ყველა საჭირო პროდუქტის ID ხელით მითითება
  // როცა ახალი პროდუქტი ემატება, უნდა დავამატოთ იდენტიფიკატორი აქ
  // და შემდეგ გადავაბილდოთ აპლიკაცია
  return [
    { id: 'CyPeQlm4lKBCy4p3IyPI' },
    // დაამატე აქ სხვა პროდუქტების ID-ები ხელით
    { id: 'Kz6AhKS52Cj3G4zCxINi' },
    // ახალი დამატებული პროდუქტი
    { id: 'rkVZ1tYjku6SSjRXLIpw' },
    // წინასწარი პარამეტრები დეველოპმენტისთვის - ეს ყველა პროდუქტი, რომელიც მუშაობს
    { id: 'product1' },
    { id: 'product2' },
    { id: 'product3' },
    { id: 'product4' },
    { id: 'product5' }
  ];
}

// სერვერის მხარეს default ფუნქცია
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // Next.js App Router-ში, ასინქრონულ კომპონენტებში params უნდა იყოს "await"-ი 
  // სანამ მის თვისებებს გამოვიყენებთ
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  // კლიენტის კომპონენტის დაბრუნება ID-ის გადაცემით
  return <ProductDetailClient id={id} />;
} 