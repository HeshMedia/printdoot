"use client";
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ShoppingBag, Heart, MapPin } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useUser();
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center">          <Avatar className="w-24 h-24 border-4 border-primary/10">
            <AvatarImage
              src={user?.imageUrl || '/default-avatar.png'}
              alt={user?.fullName || 'User'}
            />
            <AvatarFallback className="text-xl font-semibold bg-primary text-white">
              {user?.firstName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-xl">{user?.fullName || 'User'}</CardTitle>
          <CardDescription className="text-center">
            {user?.emailAddresses[0]?.emailAddress || 'No email provided'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <nav className="space-y-2">
          <Button 
            variant={activeTab === 'profile' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            My Profile
          </Button>
          <Button 
            variant={activeTab === 'orders' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Orders
          </Button>
          <Button 
            variant={activeTab === 'wishlist' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button 
            variant={activeTab === 'addresses' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Addresses
          </Button>
        </nav>
      </CardContent>
    </Card>
  );
}
