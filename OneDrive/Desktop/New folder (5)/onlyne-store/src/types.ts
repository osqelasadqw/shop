// Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Category type
export interface Category {
  id: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
}

// Cart Item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// User type
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
} 