'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-3xl font-bold mb-4">გვერდი ვერ მოიძებნა</h2>
        <p className="text-muted-foreground mb-8">
          თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს ან წაშლილია.
          გთხოვთ, შეამოწმოთ URL ან დაბრუნდეთ მთავარ გვერდზე.
        </p>
        <Button asChild>
          <Link href="/shop">
            მთავარ გვერდზე დაბრუნება
          </Link>
        </Button>
      </div>
    </div>
  );
} 