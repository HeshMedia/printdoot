"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SignInCard() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="bg-primary/5 rounded-t-lg">
          <CardTitle className="text-center text-primary">Sign In Required</CardTitle>
          <CardDescription className="text-center">Please sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 space-y-6">            
          <Image
            src="/logo.png"
            alt="Printdoot Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
          <p className="text-center text-muted-foreground">You need to log in to view your account, orders, and preferences.</p>            
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/sign-in')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push('/sign-up')}
            variant="outline"
            className="w-full"
          >
            Create Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
