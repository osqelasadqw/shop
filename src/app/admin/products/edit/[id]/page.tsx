import ProductEditClient from '../../[id]/client';

// სტატიკური გვერდი ადმინის პროდუქტის რედაქტირებისთვის
export function generateStaticParams() {
  const ids = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  return ids.map(id => ({ id }));
}

export default function ProductEditPage({ params }: { params: { id: string } }) {
  return <ProductEditClient id={params.id} />;
} 