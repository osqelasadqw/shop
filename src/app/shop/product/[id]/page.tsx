import { getProductById } from '@/lib/firebase-service';
import { cache } from 'react';
import ProductDetailClient from './client';

// გადავაკეშოთ შედეგი რომ არ მოხდეს მრავალჯერადი მოთხოვნა
const getProduct = cache(async (id: string) => {
  return await getProductById(id);
});

// დინამიური პარამეტრები
export const dynamicParams = true;

// სტატიკური მარშრუტების გენერაცია 404 შეცდომების თავიდან ასაცილებლად
export function generateStaticParams() {
  // უნდა დავაბრუნოთ ძალიან ბევრი შესაძლო პარამეტრი, რათა GitHub Pages-მა
  // წინასწარ შექმნას სტატიკური ფაილები პროდუქტების გვერდებისთვის
  
  const productIds = [
    // რეალური პროდუქტების ID-ები
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'K3J3kfOcvW4Q32O6PsQO',
    'vnzapH1bpu9fiWtXhGAI',
    'xAl4tjHYDaSj1SqY7fws',
    'kxmyaIWawvglUxWsRf6s',
    'kwERjuedjengfm1PuJnT',
    'oLJgXQd2BmJf6Zzk7MdC',
    '0s6osYbIE1RlQGgzi6ky',
    'fvSN8QZazRtek6avxE2z',
    'aqoKz04y5BdaYVfAjR6M',
    // დამატებით ხელოვნური პარამეტრები ბევრი სხვადასხვა სიგრძით
    ...Array.from({ length: 100 }, (_, i) => `product${i}`),
    ...Array.from({ length: 10 }, (_, i) => `test${i}`),
    ...Array.from({ length: 10 }, (_, i) => `item${i}`),
    'placeholder', 'demo', 'sample', 'example',
    // რანდომულად დაგენერირებული იდენტიფიკატორები 
    ...Array.from({ length: 20 }, (_, i) => 
      Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15)
    ),
  ];
  
  // გარდავქმნათ მასივი ობიექტების მასივად { id: string }
  return productIds.map(id => ({ id }));
}

// სერვერის მხარეს default ფუნქცია
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // პარამეტრების მიღება მარშრუტიდან
  const routeId = params.id;
  
  // კლიენტის კომპონენტის დაბრუნება ID-ის გადაცემით
  // შენიშვნა: localStorage-ის ამოღება ხდება კლიენტის კომპონენტში
  return <ProductDetailClient id={routeId} />;
} 