'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { useCart } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { getPromoCodes } from '@/lib/firebase-service';
// import { PromoCode } from '@/types'; // Commented out problematic import
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [activePromo, setActivePromo] = useState<any | null>(null); // Changed type to any
  const [promoError, setPromoError] = useState<string | null>(null);
  
  // პრომოკოდის გარეშე ჯამური ფასი
  const rawTotalPrice = totalPrice;
  
  // პრომოკოდის გათვალისწინებით საბოლოო ფასი, დაცული გამოთვლა
  const finalTotal = useMemo(() => {
    // არ გამოვიყენოთ პრომოკოდი თუ არ არის აქტიური
    if (!activePromo) return rawTotalPrice;
    
    // მოვძებნოთ პროდუქტი, რომელზეც მოქმედებს პრომოკოდი
    const targetProduct = items.find(item => item.product.id === activePromo.productId);
    
    // თუ პროდუქტი არ არის კალათაში, არ გამოვიყენოთ ფასდაკლება
    if (!targetProduct) return rawTotalPrice;
    
    // ფასდაკლების პროცენტის ვალიდაცია
    const discountPercentage = Math.min(Math.max(activePromo.discountPercentage, 0), 100);
    
    // გამოვთვალოთ ფასდაკლების ღირებულება კონკრეტულ პროდუქტზე
    const productTotal = targetProduct.product.price * targetProduct.quantity;
    const discountAmount = productTotal * (discountPercentage / 100);
    
    // სრული ჯამური ფასიდან გამოვაკლოთ ფასდაკლება
    return parseFloat(Math.max(rawTotalPrice - discountAmount, 0).toFixed(2));
  }, [rawTotalPrice, activePromo, items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
    }).format(amount);
  };
  
  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      toast.error('გთხოვთ შეიყვანოთ პრომოკოდი');
      return;
    }
    
    setIsPromoLoading(true);
    setPromoError(null);
    
    try {
      // მივიღებთ ყველა აქტიურ პრომოკოდს
      const promoCodes = await getPromoCodes();
      
      // ვეძებთ, არის თუ არა შეყვანილი პრომოკოდი აქტიურების სიაში
      const foundPromo = promoCodes.find(
        (p) => p.promoCode && p.promoCode.toLowerCase() === promoCode.toLowerCase()
      );
      
      if (foundPromo) {
        // ვამოწმებთ, არის თუ არა პროდუქტი კალათაში, რომელზეც მოქმედებს პრომოკოდი
        const matchingProduct = items.find(item => item.product.id === foundPromo.productId);
        
        if (matchingProduct) {
          setActivePromo({
            code: foundPromo.promoCode,
            productId: foundPromo.productId,
            discountPercentage: foundPromo.discountPercentage,
            active: true,
            createdAt: foundPromo.createdAt,
            updatedAt: foundPromo.updatedAt
          });
          toast.success('პრომოკოდი წარმატებით გააქტიურდა');
        } else {
          setPromoError('პრომოკოდი ვერ გააქტიურდა: შესაბამისი პროდუქტი არ არის კალათაში');
          toast.error('პრომოკოდი ვერ გააქტიურდა: შესაბამისი პროდუქტი არ არის კალათაში');
        }
      } else {
        setPromoError('არასწორი პრომოკოდი');
        toast.error('არასწორი პრომოკოდი');
      }
    } catch (error) {
      console.error('შეცდომა პრომოკოდის შემოწმებისას:', error);
      setPromoError('შეცდომა პრომოკოდის შემოწმებისას');
      toast.error('შეცდომა პრომოკოდის შემოწმებისას');
    } finally {
      setIsPromoLoading(false);
    }
  };
  
  const clearPromoCode = () => {
    setActivePromo(null);
    setPromoCode('');
    setPromoError(null);
    toast.info('პრომოკოდი გაუქმებულია');
  };

  // შეკვეთის განთავსების ფუნქცია დამატებითი უსაფრთხოების შემოწმებით
  const placeOrder = async () => {
    try {
      // მომხმარებლის დამოწმება აუთენტიფიკაციის გარეშე არ გამოვიდეს
      // TODO: შეკვეთის დასრულებისთვის საჭიროა ავტორიზაცია
      
      // თუ გამოიყენება პრომოკოდი, სერვერზე ვადასტურებთ მის ვალიდურობას
      if (activePromo) {
        // სერვერიდან ვამოწმებთ პრომოკოდის ნამდვილობას
        const serverPromoCodes = await getPromoCodes();
        const validPromo = serverPromoCodes.find(
          p => p.promoCode === activePromo.code && 
              p.productId === activePromo.productId && 
              p.active === true
        );
        
        if (!validPromo) {
          toast.error('პრომოკოდი აღარ არის აქტიური, გთხოვთ სცადოთ თავიდან');
          setActivePromo(null);
          return;
        }
        
        // შევამოწმოთ თანხვედრა ფასდაკლების პროცენტებს შორის
        if (validPromo.discountPercentage !== activePromo.discountPercentage) {
          toast.error('პრომოკოდის მონაცემები შეიცვალა, ვაახლებთ...');
          setActivePromo({
            ...activePromo,
            discountPercentage: validPromo.discountPercentage
          });
          return;
        }
      }
      
      // TODO: აქ გააგრძელეთ შეკვეთის განთავსების პროცესი
      toast.success('შეკვეთა წარმატებით განთავსდა');
    } catch (error) {
      console.error('შეცდომა შეკვეთის განთავსებისას:', error);
      toast.error('შეცდომა შეკვეთის განთავსებისას');
    }
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
            {items.map((item) => {
              // თუ ეს არის პროდუქტი, რომელზეც ვრცელდება პრომოკოდი
              const hasPromoDiscount = activePromo && activePromo.productId === item.product.id;
              
              return (
                <div 
                  key={item.product.id} 
                  className={`flex items-start space-x-4 border p-4 rounded-md ${hasPromoDiscount ? 'border-primary' : ''}`}
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.product.images[0] || 'https://placehold.co/400x400/eee/999?text=No+Image'}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link 
                          href={`/shop/product/${item.product.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        
                        {/* პრომოკოდის ბეჯი */}
                        {hasPromoDiscount && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            <Tag className="mr-1 h-3 w-3" />
                            -{activePromo.discountPercentage}%
                          </span>
                        )}
                      </div>
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
                      <div>
                        {hasPromoDiscount ? (
                          <div className="flex flex-col">
                            <p className="text-sm line-through text-muted-foreground">
                              {formatCurrency(item.product.price)}
                            </p>
                            <p className="font-medium text-primary">
                              {formatCurrency(item.product.price * (1 - Math.min(Math.max(activePromo?.discountPercentage || 0, 0), 100) / 100))}
                            </p>
                          </div>
                        ) : (
                          <p className="font-medium">
                            {formatCurrency(item.product.price)}
                          </p>
                        )}
                      </div>
                      
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
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-md border p-6 space-y-6">
              <h2 className="text-lg font-medium">შეკვეთის შეჯამება</h2>
              
              {/* პრომოკოდის შეყვანის ფორმა */}
              <div className="space-y-3">
                <form onSubmit={handlePromoCodeSubmit} className="flex space-x-2">
                  <div className="flex-grow relative">
                    <Input
                      placeholder="პრომოკოდი"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!activePromo || isPromoLoading}
                    />
                    {activePromo && (
                      <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {activePromo ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={clearPromoCode}
                    >
                      გაუქმება
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={!promoCode.trim() || isPromoLoading}
                    >
                      {isPromoLoading ? '...' : 'გააქტიურება'}
                    </Button>
                  )}
                </form>
                
                {/* პრომოკოდის შეცდომის ან წარმატების შეტყობინებები */}
                {promoError && (
                  <div className="flex items-center text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{promoError}</span>
                  </div>
                )}
                
                {activePromo && (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>პრომოკოდი გააქტიურებულია -{activePromo.discountPercentage}%</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ჯამური თანხა</span>
                  <span>{formatCurrency(rawTotalPrice)}</span>
                </div>
                
                {activePromo && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>ფასდაკლება</span>
                    <span>-{formatCurrency(rawTotalPrice - finalTotal)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">მიტანის საფასური</span>
                  <span>უფასო</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between font-medium">
                  <span>გადასახდელი თანხა</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              
              <Button className="w-full" onClick={placeOrder}>შეკვეთის განთავსება</Button>
              
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