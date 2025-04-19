import { ProductEditClient } from './product-edit-client';

export const dynamic = 'force-dynamic';

export default function ProductEditPage({ params }: { params: { id: string } }) {
  return <ProductEditClient id={params.id} />;
} 