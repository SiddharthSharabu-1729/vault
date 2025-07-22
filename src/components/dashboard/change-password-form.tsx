
'use client';

import React, { useState } from 'react';
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
import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doChangePassword } from '@/services/auth';
import { reEncryptAllEntries } from '@/services/firestore';
import { ReEncryptProgress, type ProgressStep } from './re-encrypt-progress';
import { useVault } from '@/contexts/vaultContext';


interface ChangePasswordFormProps {
  children: React.ReactNode;
}

export function ChangePasswordForm({ children }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const { entries, fetchAllData } = useVault();

  const [open, setOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState<ProgressStep>('idle');
  const [progressError, setProgressError] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
  };
  
  const closeAll = () => {
    setOpen(false);
    setProgressOpen(false);
    resetForm();
    setTimeout(() => {
        setProgress('idle');
        setProgressError(null);
    }, 500);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure the new passwords are the same.',
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Password Too Short',
            description: 'Your new password must be at least 6 characters long.',
          });
          return;
    }

    setIsSaving(true);
    setProgressOpen(true);
    setProgressError(null);

    try {
      // Step 1: Re-encrypt the entire vault
      setProgress('verifying');
      await reEncryptAllEntries(entries, currentPassword, newPassword, (step) => setProgress(step));

      // Step 2: Change the authentication password in Firebase Auth
      setProgress('finalizing');
      await doChangePassword(currentPassword, newPassword);

      setProgress('complete');
      toast({
        title: 'Password & Vault Updated',
        description: 'Your password has been changed and your vault has been re-encrypted.',
      });
      
      // Step 3: Fetch the latest data to ensure UI has the new hashes
      await fetchAllData();


      // Auto-close dialogs on success after a delay
      setTimeout(() => {
        closeAll();
      }, 2000);


    } catch (error: any) {
      setProgress('error');
      setProgressError(error.message || 'An unknown error occurred during the update.');
      // No need to toast here as the progress dialog shows the error.
    } finally {
      setIsSaving(false);
      // Don't close the dialog automatically on error, let the user close it
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) closeAll(); else setOpen(true);}}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Master Password</DialogTitle>
            <DialogDescription>
              This is a high-security operation. Changing your master password will re-encrypt your entire vault.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type="password"
                    required
                    className="pl-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    required
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    required
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ReEncryptProgress open={progressOpen} progress={progress} error={progressError} onOpenChange={(isOpen) => { if (!isOpen) closeAll() }} />
    </>
  );
}
