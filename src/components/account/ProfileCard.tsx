"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { getUserDetails, UserDetails } from '@/lib/api/user';

interface ProfileCardProps {
  onEdit?: () => void;
}

export function ProfileCard({ onEdit }: ProfileCardProps) {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const details = await getUserDetails(user.id);
        console.log("Profile details loaded:", details);
        setUserDetails(details);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [user?.id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="shadow-md border-0">      <CardHeader className="pb-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Personal Information</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </CardHeader>      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
            <p className="font-medium">
              {userDetails?.first_name && userDetails?.last_name 
                ? `${userDetails.first_name} ${userDetails.last_name}`
                : user?.fullName || 'Not provided'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
            <p className="font-medium">
              {userDetails?.phone_number || user?.phoneNumbers?.[0]?.phoneNumber || 'Not provided'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h3>
            <p className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
          {userDetails && (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                <p className="font-medium">{userDetails.address || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">City</h3>
                <p className="font-medium">{userDetails.city || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">State</h3>
                <p className="font-medium">{userDetails.state || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Country & PIN</h3>
                <p className="font-medium">
                  {userDetails.country ? `${userDetails.country}, ` : ''}
                  {userDetails.pin_code || 'PIN not provided'}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
