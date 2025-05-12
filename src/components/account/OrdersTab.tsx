"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export function OrdersTab() {
  const router = useRouter();
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>View and track all your orders here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <p className="text-sm text-muted-foreground mt-2">When you place orders, they will appear here</p>
          <Button 
            className="mt-6" 
            onClick={() => router.push('/products')}
          >
            Start Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
