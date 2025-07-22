
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fingerprint, KeyRound, Mail, ShieldCheck, Smile, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { doSignInWithEmailAndPassword, getFriendlyAuthErrorMessage } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordForm } from './forgot-password-form';


export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await doSignInWithEmailAndPassword(email, password);
      // No toast on success, just redirect.
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: getFriendlyAuthErrorMessage(error),
      });
      setIsSigningIn(false);
    }
  };

  const handleBiometricLogin = () => {
    toast({
        title: 'Feature Not Implemented',
        description: 'Biometric authentication is coming soon!',
      });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your vault.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Master Password</Label>
                <p className="text-xs text-muted-foreground">Your key to the vault.</p>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                required 
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSigningIn}>
            {isSigningIn ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            {isSigningIn ? 'Unlocking...' : 'Unlock Vault'}
          </Button>
        </form>
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={handleBiometricLogin}>
            <Fingerprint className="mr-2 h-4 w-4 text-primary" />
            Sign in with Fingerprint
          </Button>
          <Button variant="outline" className="w-full" onClick={handleBiometricLogin}>
            <Smile className="mr-2 h-4 w-4 text-primary" />
            Sign in with Face ID
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
