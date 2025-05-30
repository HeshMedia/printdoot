"use client";
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';

// Import our modularized components
import { SignInCard } from '@/components/account/SignInCard';
import { Sidebar } from '@/components/account/Sidebar';
import { ProfileTab } from '@/components/account/ProfileTab';
import { OrdersTab } from '@/components/account/OrdersTab';
import { WishlistTab } from '@/components/account/WishlistTab';
import { AddressesTab } from '@/components/account/AddressesTab';

function AccountPage() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  if (!isSignedIn) {
    return <SignInCard />;
  }  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-3">
          <Sidebar
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </div>

        {/* Main Content */}
        <div className="md:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile" className="m-0">
              <ProfileTab  />
            </TabsContent>

            <TabsContent value="orders" className="m-0">
              <OrdersTab />
            </TabsContent>

            <TabsContent value="wishlist" className="m-0">
              <WishlistTab />
            </TabsContent>

            <TabsContent value="addresses" className="m-0">
              <AddressesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;