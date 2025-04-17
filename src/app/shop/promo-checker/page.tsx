'use client';

import { useState } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getPromoCodes } from '@/lib/firebase-service';
import { toast } from 'sonner';
import { Percent } from 'lucide-react';

export default function PromoCheckerPage() {
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    isValid: boolean;
    message: string;
    productName?: string;
    discountPercentage?: number;
    productId?: string;
  } | null>(null);

  const checkPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('გთხოვთ შეიყვანოთ პრომოკოდი');
      return;
    }

    setIsCheckingPromo(true);
    setPromoResult(null);

    try {
      // მივიღოთ ყველა აქტიური პრომოკოდი
      const allPromoCodes = await getPromoCodes();
      
      // მოძებნა პრომოკოდი
      const matchingPromo = allPromoCodes.find(
        (p) => p.promoCode && p.promoCode.toLowerCase() === promoCode.toLowerCase()
      );

      if (matchingPromo) {
        setPromoResult({
          isValid: true,
          message: 'პრომოკოდი აქტიურია',
          productName: matchingPromo.productName,
          discountPercentage: matchingPromo.discountPercentage,
          productId: matchingPromo.productId
        });
        toast.success('პრომოკოდი ვალიდურია');
      } else {
        setPromoResult({
          isValid: false,
          message: 'პრომოკოდი არ არსებობს ან არაა აქტიური'
        });
        toast.error('პრომოკოდი არ არსებობს ან არაა აქტიური');
      }
    } catch (error) {
      console.error('შეცდომა პრომოკოდის შემოწმებისას:', error);
      toast.error('შეცდომა პრომოკოდის შემოწმებისას');
      setPromoResult({
        isValid: false,
        message: 'შეცდომა პრომოკოდის შემოწმებისას'
      });
    } finally {
      setIsCheckingPromo(false);
    }
  };

  return (
    <ShopLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">პრომოკოდის შემოწმება</h1>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>პრომოკოდის შემოწმება</CardTitle>
              <CardDescription>
                შეიყვანეთ პრომოკოდი ვალიდურობის შესამოწმებლად
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="promoCode">პრომოკოდი</Label>
                  <Input
                    id="promoCode"
                    placeholder="მაგ. SUMMER50"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>

                {promoResult && (
                  <div className={`p-4 rounded-md ${
                    promoResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium ${promoResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {promoResult.message}
                    </p>
                    
                    {promoResult.isValid && promoResult.productName && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">პროდუქტი: <span className="font-medium">{promoResult.productName}</span></p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          ფასდაკლება: <Percent className="inline-block h-3 w-3 mx-1" /> 
                          <span className="font-medium">{promoResult.discountPercentage}%</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={checkPromoCode} 
                disabled={isCheckingPromo || !promoCode.trim()}
                className="w-full"
              >
                {isCheckingPromo ? 'მიმდინარეობს შემოწმება...' : 'შემოწმება'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ShopLayout>
  );
} 