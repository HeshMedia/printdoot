"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addUserDetails, updateUserDetails, getUserDetails, UserDetails } from '@/lib/api/user';
import { useToast } from '@/components/ui/use-toast';

const userFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pin_code: z.string().min(1, 'PIN code is required')
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserDetailsFormProps {
  onSuccess?: () => void;
  showHeader?: boolean;
}

export function UserDetailsForm({ onSuccess, showHeader = true }: UserDetailsFormProps) {
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { toast } = useToast();
  const clerkId = user?.id;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pin_code: ''
    }
  });

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!isSignedIn || !clerkId) return;

      setIsLoading(true);
      try {
        // First try to get existing user details
        const userDetails = await getUserDetails(clerkId);
        
        if (userDetails) {
          // If user details exist, populate the form
          form.reset({
            first_name: userDetails.first_name || user?.firstName || '',
            last_name: userDetails.last_name || user?.lastName || '',
            email: userDetails.email || user?.emailAddresses[0]?.emailAddress || '',
            phone_number: userDetails.phone_number || user?.phoneNumbers?.[0]?.phoneNumber || '',
            address: userDetails.address || '',
            city: userDetails.city || '',
            state: userDetails.state || '',
            country: userDetails.country || '',
            pin_code: userDetails.pin_code || ''
          });
        } else {
          // If no user details, use clerk user data where available
          form.reset({
            first_name: user?.firstName || '',
            last_name: user?.lastName || '',
            email: user?.emailAddresses[0]?.emailAddress || '',
            phone_number: user?.phoneNumbers?.[0]?.phoneNumber || '',
            address: '',
            city: '',
            state: '',
            country: '',
            pin_code: ''
          });
        }
      } catch (error) {
        console.error('Error loading user details:', error);
        toast({
          title: "Error loading profile",
          description: "We couldn't load your profile information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };

    loadUserDetails();
  }, [clerkId, isSignedIn, user, form, toast]);

  const onSubmit = async (values: UserFormValues) => {
    if (!clerkId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update your details",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const userDetails: UserDetails = {
        ...values,
        clerkId
      };

      // First try to get existing user details to determine if we need to create or update
      const existingDetails = await getUserDetails(clerkId);
      
      if (existingDetails) {
        // Update existing user details
        await updateUserDetails(clerkId, values);
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully."
        });
      } else {
        // Add new user details
        await addUserDetails(userDetails);
        toast({
          title: "Profile created",
          description: "Your profile information has been saved successfully."
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      toast({
        title: "Error saving profile",
        description: "We couldn't save your profile information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialLoadComplete) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pin_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Details'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
