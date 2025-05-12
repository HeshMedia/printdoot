"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ShoppingBag } from 'lucide-react';

export function ActivityCard() {
  const router = useRouter();
  
  return (
    <Card className="shadow-md border-0 mt-6">
      <CardHeader className="pb-4 border-b">
        <CardTitle>Account Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure your email preferences for orders, promotions, and account updates.</p>
              <Button variant="link" className="p-0 h-auto mt-1">Manage Notifications</Button>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Recent Orders</h3>
              <p className="text-sm text-muted-foreground">You have no recent orders. Start shopping now!</p>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-1" 
                onClick={() => router.push('/products')}
              >
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => router.push('/products')}
        >
          Explore Products
        </Button>
      </CardFooter>
    </Card>
  );
}
