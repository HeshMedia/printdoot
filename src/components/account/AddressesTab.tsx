"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Plus, Loader2, Edit, Trash } from 'lucide-react';
import { UserDetailsForm } from './UserDetailsForm';
import { getUserDetails, UserDetails } from '@/lib/api/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AddressesTab() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string>('view');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const details = await getUserDetails(user.id);
        setUserDetails(details);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [user?.id]);

  const hasAddress = userDetails && (
    userDetails.address || 
    userDetails.city || 
    userDetails.state || 
    userDetails.country || 
    userDetails.pin_code
  );

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Addresses</CardTitle>
            <CardDescription>Manage your shipping and billing addresses</CardDescription>
          </div>
          {hasAddress && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setActiveTab('edit')}
            >
              <Edit className="h-4 w-4" /> Edit Address
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !hasAddress ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No addresses saved</h3>
                <p className="text-sm text-muted-foreground mt-2">Add addresses for faster checkout</p>
                <Button 
                  className="mt-6"
                  onClick={() => setActiveTab('edit')}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Address
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Primary Address</h3>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {userDetails.first_name} {userDetails.last_name}
                    </p>
                    <p>{userDetails.address}</p>
                    <p>
                      {userDetails.city}, {userDetails.state} {userDetails.pin_code}
                    </p>
                    <p>{userDetails.country}</p>
                    <p className="mt-2">{userDetails.phone_number}</p>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('edit')}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit">
            <UserDetailsForm 
              onSuccess={() => {
                setActiveTab('view');
              }}
              showHeader={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
