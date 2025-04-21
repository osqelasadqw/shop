import { Metadata } from 'next';
import ProductDetailClient from './client';
import { getProductById, getProducts } from '@/lib/firebase-service';

// Generate static params for static export
export async function generateStaticParams() {
  // მნიშვნელოვანი: ყველა ცნობილი ID-ის ჩართვა, რომელიც გვჭირდება
  const knownProductIds = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  try {
    // Get all products to generate static paths
    const products = await getProducts();
    const productIds = products.map(product => product.id);
    
    // გავაერთიანოთ ორივე სია და გავფილტროთ დუბლიკატები
    const allIds = [...new Set([...knownProductIds, ...productIds])];
    
    return allIds.map(id => ({ id }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return our known product IDs if we can't fetch from the database
    return knownProductIds.map(id => ({ id }));
  }
}

// Generate dynamic metadata for each product
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await getProductById(params.id);
    
    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found',
      };
    }
    
    return {
      title: product.name,
      description: product.description.substring(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.substring(0, 160),
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Details',
      description: 'View product details',
    };
  }
}

// Dynamic route for product details
export default function ProductPage({ params }: { params: { id: string } }) {
  // Return the product detail client component with the ID passed from the URL
  return <ProductDetailClient id={params.id} />;
}