'use client';

import React, { useState, useEffect } from 'react';
import { ShopLayout } from '@/components/layouts/shop-layout';
import { getSettings } from '@/lib/firebase-service';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        setIsLoading(true);
        const settings = await getSettings();
        if (settings && settings.aboutUsContent) {
          setAboutContent(settings.aboutUsContent as string);
        }
      } catch (error) {
        console.error("Error loading about page content:", error);
        // Optionally show an error message to the user
      } finally {
        setIsLoading(false);
      }
    };
    loadAboutContent();
  }, []);

  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 border-b pb-3">ჩვენს შესახებ</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div 
            className="prose lg:prose-xl max-w-none" 
            dangerouslySetInnerHTML={{ __html: aboutContent.replace(/\n/g, '<br />') || '<p>ინფორმაცია მალე დაემატება...</p>' }}
          />
        )}
      </div>
    </ShopLayout>
  );
} 