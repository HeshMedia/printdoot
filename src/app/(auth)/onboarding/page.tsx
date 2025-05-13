"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { UserDetailsForm } from '@/components/account/UserDetailsForm';
import { getUserDetails } from '@/lib/api/user';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // If user is not signed in, redirect to sign in page
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if user already has details
    const checkUserDetails = async () => {
      if (!isSignedIn || !user) return;
        try {
        const clerkId = user.id;
        console.log("Checking user details for clerkId:", clerkId);
        const details = await getUserDetails(clerkId);
        console.log("Onboarding - user details:", details);
        
        // If user already has details, redirect to account page
        if (details) {
          setHasDetails(true);
          router.push('/account');
        } else {
          setHasDetails(false);
        }
      } catch (error) {
        console.error('Error checking user details:', error);
        setHasDetails(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserDetails();
  }, [isLoaded, isSignedIn, user, router]);

  const handleSuccess = () => {
    router.push('/account');
  };

  // While checking or waiting for Clerk to load
  if (isChecking || !isLoaded) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // If user already has details, they'll be redirected automatically
  // This is just a fallback
  if (hasDetails) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Redirecting to your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Printdoot!</CardTitle>
          <CardDescription>
            Please complete your profile information to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserDetailsForm onSuccess={handleSuccess} showHeader={false} />
        </CardContent>
      </Card>
    </div>
  );
}
