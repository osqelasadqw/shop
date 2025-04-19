'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ZoomedImageModalProps {
  currentImage: string;
  productName: string;
  hasMultipleImages: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

// ეს კომპონენტი ახლა გატანილია ცალკე ფაილში, 
// რათა შესაძლებელი იყოს მისი წინასწარი ჩატვირთვა
export default function ZoomedImageModal({
  currentImage,
  productName,
  hasMultipleImages,
  onClose,
  onPrev,
  onNext
}: ZoomedImageModalProps) {
  // საუკეთესო პრაქტიკა - პრევენცია ზედმეტი რერენდერებისგან
  const handleContainerClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
        onClick={onClose}
        aria-label="დახურე გადიდებული სურათი"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      
      <div 
        className="w-full max-w-screen-lg h-[80vh] md:h-[85vh] relative bg-white rounded-lg p-2 sm:p-4 shadow-2xl flex items-center justify-center overflow-hidden" 
        onClick={handleContainerClick}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage}
            alt={productName}
            className="max-h-full max-w-full object-contain"
            width={1200}
            height={1200}
            style={{ objectFit: 'contain' }}
            priority // სურათს მიენიჭება მაღალი პრიორიტეტი ჩატვირთვისას
            loading="eager" // მყისიერი ჩატვირთვა
            sizes="(max-width: 768px) 100vw, 90vw" // რესპონსიული ზომები
          />
        </div>
        
        {hasMultipleImages && (
          <>
            <button 
              onClick={onPrev} 
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 sm:p-3 rounded-full shadow-md hover:bg-opacity-100 transition-all z-10"
              aria-label="წინა სურათი"
            >
              <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 text-gray-800" />
            </button>
            <button 
              onClick={onNext}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 sm:p-3 rounded-full shadow-md hover:bg-opacity-100 transition-all z-10"
              aria-label="შემდეგი სურათი"
            >
              <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 text-gray-800" />
            </button>
          </>
        )}
      </div>
    </div>
  );
} 