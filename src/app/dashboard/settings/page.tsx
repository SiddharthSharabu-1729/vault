
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/hooks/use-toast';
import type { Category, ActivityLog } from '@/lib/data';
import { getCategories, addCategory, getActivityLogs, addActivityLog } from '@/services/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordForm } from '@/components/dashboard/change-password-form';


function SettingsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchAllData = async () => {
    if (!currentUser) return;
    setPageLoading(true);
    try {
      const [userCategories, userLogs] = await Promise.all([
        getCategories(),
        getActivityLogs(),
      ]);
      setCategories(userCategories);
      setActivityLogs(userLogs);
    } catch (error) {
      console.error("Error fetching settings data:", error);
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: 'Could not load your settings and activity.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    try {
      await addCategory(newCategoryData);
      await addActivityLog('Category Created', `New category "${newCategoryData.name}" was added.`);
      toast({
        title: 'Category Created',
        description: `${newCategoryData.name} has been added.`,
      });
      await fetchAllData(); // Refresh categories and logs
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new category.',
      });
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account Profile</CardTitle>
                  <CardDescription>Your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.email}`} alt="Avatar" />
                            <AvatarFallback>{currentUser?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold">{currentUser?.email}</h3>
                            <p className="text-sm text-muted-foreground">Fortress Vault User</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">{currentUser?.email}</span>
                        </div>
                         <div className="flex items-center">
                            <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">Account security is active</span>
                        </div>
                         <div className="flex items-center">
                            <Clock className="mr-3 h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">Joined on {currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <ChangePasswordForm>
                    <Button variant="outline">Change Password</Button>
                  </ChangePasswordForm>
                </CardFooter>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>A log of all significant activity in your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {pageLoading ? (
                      Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))
                    ) : activityLogs.length > 0 ? (
                      activityLogs.map(log => (
                        <div key={log.id} className="flex items-start space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">{log.details}</p>
                            <p className="text-xs text-muted-foreground pt-1">{formatDate(log.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                          <p className="text-sm text-muted-foreground">No activity has been logged yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(SettingsPage);
