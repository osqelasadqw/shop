'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">თქვენი კალათა ცარიელია</h1>
          <p className="text-muted-foreground mb-6">
            კალათაში არაფერი გაქვთ დამატებული
          </p>
          <Link href="/shop">
            <Button className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              მაღაზიაში დაბრუნება
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">კალათა</h1>
          <p className="text-muted-foreground">
            {totalItems} ნივთი კალათაში
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.product.id} 
                className="flex items-start space-x-4 border p-4 rounded-md"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                  <img
                    src={item.product.images[0] || 'https://placehold.co/400x400/eee/999?text=No+Image'}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link 
                      href={`/shop/product/${item.product.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {item.product.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-medium">
                      {formatCurrency(item.product.price)}
                    </p>
                    <div className="flex items-center border rounded-md">
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-100"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-100"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-md border p-6 space-y-6">
              <h2 className="text-lg font-medium">შეკვეთის შეჯამება</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ჯამური თანხა</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">მიტანის საფასური</span>
                  <span>უფასო</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-medium">
                  <span>გადასახდელი თანხა</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              
              <Button className="w-full">შეკვეთის განთავსება</Button>
              
              <div className="text-center">
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  მაღაზიაში დაბრუნება
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
} 