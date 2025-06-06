"use client";
import React, { useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { UserDetailsForm } from './UserDetailsForm';
import { useUser } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileTab() {
  const { user } = useUser();
  const [activeProfileTab, setActiveProfileTab] = useState('overview');
  
  return (
    <>
      <Card className="shadow-md border-0 mb-6">
        <CardHeader className="pb-2 border-b">
          <CardTitle>Account Details</CardTitle>
        </CardHeader>        <CardContent className="pt-4">
          {activeProfileTab === 'overview' ? (
            <ProfileCard onEdit={() => setActiveProfileTab('edit')} />
          ) : (
            <UserDetailsForm 
              onSuccess={() => setActiveProfileTab('overview')}
              showHeader={false}
            />
          )}
        </CardContent>
      </Card>
      
    </>
  );
}
