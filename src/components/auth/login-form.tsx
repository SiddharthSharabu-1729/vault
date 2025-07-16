'use client';

import { useRouter } from 'next/navigation';
import { Fingerprint, KeyRound, Mail, ShieldCheck, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function LoginForm() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

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
              <Input id="email" type="email" placeholder="m@example.com" required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Master Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" required className="pl-10" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Unlock Vault
          </Button>
        </form>
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <Fingerprint className="mr-2 h-4 w-4 text-primary" />
            Sign in with Fingerprint
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <Smile className="mr-2 h-4 w-4 text-primary" />
            Sign in with Face ID
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Don&apos;t have an account? <a href="#" className="text-primary hover:underline">Sign up</a>
        </p>
      </CardFooter>
    </Card>
  );
}
