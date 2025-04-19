import { ProductDetailClient } from './product-detail-client';

export const dynamic = 'force-dynamic';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient id={params.id} />;
} 