
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doDeleteUser, getFriendlyAuthErrorMessage } from '@/services/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeleteAccountFormProps {
  children: React.ReactNode;
}

export function DeleteAccountForm({ children }: DeleteAccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setPassword('');
    setIsDeleting(false);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Password Required',
        description: 'You must enter your master password to confirm account deletion.',
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      await doDeleteUser(password);
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently removed.',
      });
      setOpen(false);
      // Redirect to home page after successful deletion
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: getFriendlyAuthErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Your Account</DialogTitle>
          <DialogDescription>
            This action is final and cannot be undone. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDelete}>
            <Alert variant="destructive" className="my-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                All of your data, including vault entries and categories, will be permanently erased.
              </AlertDescription>
            </Alert>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter Master Password to Confirm</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delete-password"
                  type="password"
                  required
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm} disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldAlert className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
