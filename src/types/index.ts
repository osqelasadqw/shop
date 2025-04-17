export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  isSpecial?: boolean;
  promoCode?: string;
  discountPercentage?: number;
  promoActive?: boolean;
  hasPublicDiscount?: boolean;
  createdAt: number;
  updatedAt: number;
  specs?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

export interface PromoCode {
  code: string;
  productId: string;
  discountPercentage: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Discount {
  id: string;
  productId: string;
  discountPercentage: number;
  active: boolean;
  isPublic: boolean;
  promoCode?: string;
  expiryDate?: Date;
  createdAt: number;
  updatedAt: number;
} 