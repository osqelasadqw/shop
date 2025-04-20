import { Metadata } from 'next';
import ProductEditClient from './client';

// დინამიური პარამეტრები
export const dynamicParams = true;

// მეტადატა ფუნქცია, რომელიც აწვდის SEO ინფორმაციას
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return {
    title: `პროდუქტის დეტალები - ${params.id}`,
    description: 'პროდუქტის დეტალების გვერდი',
  };
}

// სტატიკური მარშრუტების გენერაცია 404 შეცდომების თავიდან ასაცილებლად
export function generateStaticParams() {
  const ids = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  return ids.map(id => ({ id }));
}

// სერვერის მხარის კომპონენტი, რომელიც იყენებს კლიენტის მხარის გადამისამართების კომპონენტს
export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductEditClient id={params.id} />;
}