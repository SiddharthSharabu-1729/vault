
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/authContext';
import { useVault } from '@/contexts/vaultContext';
import { useToast } from '@/hooks/use-toast';
import type { ActivityLog } from '@/lib/data';
import { getActivityLogs } from '@/services/firestore';
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
import { User, Mail, Shield, Clock, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordForm } from '@/components/dashboard/change-password-form';
import { DeleteAccountForm } from '@/components/dashboard/delete-account-form';

function SettingsPage() {
  const { currentUser } = useAuth();
  const { categories, addCategory, loading: vaultLoading } = useVault();
  const { toast } = useToast();
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const pageLoading = vaultLoading || logsLoading;

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentUser) return;
      setLogsLoading(true);
      try {
        const userLogs = await getActivityLogs();
        setActivityLogs(userLogs);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        toast({
          variant: 'destructive',
          title: 'Error Loading Activity',
          description: 'Could not load your activity log.',
        });
      } finally {
        setLogsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchLogs();
    }
  }, [currentUser, toast]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch (e) {
        return 'A while ago';
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar categories={categories} onAddCategory={addCategory} loading={vaultLoading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={addCategory} loading={vaultLoading} showSearch={false} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Account Profile</CardTitle>
                  <CardDescription>Your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {pageLoading ? (
                        <>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.email}`} alt="Avatar" />
                                    <AvatarFallback>{currentUser?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold break-all">{currentUser?.email}</h3>
                                    <p className="text-sm text-muted-foreground">Fortress Vault User</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm break-all">{currentUser?.email}</span>
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
                        </>
                    )}
                </CardContent>
                <CardFooter>
                  <ChangePasswordForm>
                    <Button variant="outline" disabled={pageLoading}>Change Password</Button>
                  </ChangePasswordForm>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>A log of all significant activity in your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {logsLoading ? (
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

               <Card className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-destructive">
                       <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Deleting your account will permanently erase your user profile, all vault entries, and all categories associated with it. This data cannot be recovered.
                  </p>
                </CardContent>
                <CardFooter>
                  <DeleteAccountForm>
                    <Button variant="destructive" disabled={pageLoading}>Delete My Account</Button>
                  </DeleteAccountForm>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(SettingsPage);
