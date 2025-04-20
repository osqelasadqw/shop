import ProductDetailClient from './client';

// სტატიკური გვერდი პროდუქტის დეტალებისთვის
export function generateStaticParams() {
  const ids = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  return ids.map(id => ({ id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  // დავაბრუნოთ პროდუქტის დეტალური კლიენტის კომპონენტი ID-ის გადაცემით
  return <ProductDetailClient id={params.id} />;
}