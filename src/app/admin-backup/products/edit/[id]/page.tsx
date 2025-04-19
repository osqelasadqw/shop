import { getAllProducts } from '@/lib/firebase-service';
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params for product pages:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `პროდუქტის რედაქტირება | ID: ${params.id}`,
  };
}

export default function ProductEditPage({ params }: PageProps) {
  return (
    <div>
      <h1>პროდუქტის რედაქტირება: {params.id}</h1>
      <p>გადამისამართება მთავარ ადმინის გვერდზე...</p>
    </div>
  );
} 
// აქ თქვენი 'use client' და ძირითადი კოდი 