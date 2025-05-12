"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export function WishlistTab() {
  const router = useRouter();
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>Products you've saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-medium">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mt-2">Save items you love to your wishlist</p>
          <Button 
            className="mt-6" 
            onClick={() => router.push('/products')}
          >
            Discover Products
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
