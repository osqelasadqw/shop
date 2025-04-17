'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

interface PromoCodeInputProps {
  onApply: (discount: number, promoCode: string) => void;
  onRemove: () => void;
  isApplied: boolean;
  appliedCode?: string;
}

export function PromoCodeInput({ 
  onApply, 
  onRemove,
  isApplied,
  appliedCode
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      toast.error('გთხოვთ შეიყვანოთ პრომოკოდი');
      return;
    }
    
    setIsChecking(true);
    
    try {
      // შევამოწმოთ არსებობს თუ არა პრომოკოდი და აქტიურია თუ არა
      const promoRef = doc(db, 'discounts', promoCode.trim());
      const promoSnap = await getDoc(promoRef);
      
      if (!promoSnap.exists()) {
        toast.error('პრომოკოდი არ არსებობს');
        return;
      }
      
      const promoData = promoSnap.data();
      
      if (!promoData.active) {
        toast.error('პრომოკოდი არ არის აქტიური');
        return;
      }
      
      if (promoData.isPublic) {
        toast.error('პრომოკოდი არასწორია');
        return;
      }
      
      // წარმატებული პრომოკოდი
      toast.success(`პრომოკოდი გააქტიურებულია: ${promoData.discountPercentage}% ფასდაკლება`);
      onApply(promoData.discountPercentage, promoCode);
      setPromoCode('');
    } catch (error) {
      console.error('შეცდომა პრომოკოდის შემოწმებისას:', error);
      toast.error('შეცდომა პრომოკოდის შემოწმებისას');
    } finally {
      setIsChecking(false);
    }
  };

  if (isApplied) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500 h-4 w-4" />
          <span className="text-sm font-medium">
            პრომოკოდი გააქტიურებულია: <strong>{appliedCode}</strong>
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          className="h-7 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="პრომოკოდი"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button 
        type="submit"
        disabled={isChecking || !promoCode.trim()} 
        size="sm"
      >
        გააქტიურება
      </Button>
    </form>
  );
} 