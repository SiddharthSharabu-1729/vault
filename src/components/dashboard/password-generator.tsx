'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export function PasswordGenerator({ children }: { children: React.ReactNode }) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    const lowerCharset = 'abcdefghijklmnopqrstuvwxyz';
    const upperCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberCharset = '0123456789';
    const symbolCharset = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charset = lowerCharset;
    if (includeUppercase) charset += upperCharset;
    if (includeNumbers) charset += numberCharset;
    if (includeSymbols) charset += symbolCharset;
    
    if(charset.length === 0) {
        setPassword('');
        return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);
  
  const handleCopy = () => {
    if(password){
      navigator.clipboard.writeText(password);
      toast({
        title: 'Password Copied',
        description: 'The new password has been copied to your clipboard.',
      });
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
          <DialogDescription>
            Create a strong, unique password for your accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Input
              id="password"
              value={password}
              readOnly
              className="pr-20 font-mono text-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button variant="ghost" size="icon" onClick={generatePassword}>
                <RefreshCw className="h-4 w-4" />
              </Button>
               <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="length">Password Length</Label>
              <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm font-medium text-muted-foreground">
                {length}
              </span>
            </div>
            <Slider
              id="length"
              max={64}
              min={8}
              step={1}
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
            />
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="symbols">Include Symbols (!@#$..)</Label>
                <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            </div>
          </div>
        </div>
        <DialogFooter>
          {/* In a real app, this might save the entry */}
          <Button className="w-full">Use this Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
