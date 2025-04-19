'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-20 w-20 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">დაფიქსირდა შეცდომა</h2>
        <p className="text-muted-foreground mb-8">
          სამწუხაროდ, აპლიკაციაში დაფიქსირდა შეცდომა. სცადეთ გვერდის განახლება ან
          დაბრუნდით მთავარ გვერდზე.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="outline">
            თავიდან სცადეთ
          </Button>
          <Button asChild>
            <Link href="/shop">
              მთავარ გვერდზე დაბრუნება
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 