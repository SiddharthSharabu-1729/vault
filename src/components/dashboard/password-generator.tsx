'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Save, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { PasswordEntry, Category } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getIconForUrl } from '@/ai/flows/get-icon-flow';

interface PasswordGeneratorProps {
  children: React.ReactNode;
  onAddEntry: (newEntry: Omit<PasswordEntry, 'id'>) => void;
  entry?: PasswordEntry;
  categories: Category[];
}

export function PasswordGenerator({
  children,
  onAddEntry,
  entry,
  categories
}: PasswordGeneratorProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!entry;

  const [length, setLength] = useState(entry ? entry.password.length : 16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  const [password, setPassword] = useState(entry ? entry.password : '');
  const [serviceName, setServiceName] = useState(entry ? entry.serviceName : '');
  const [username, setUsername] = useState(entry ? entry.username : '');
  const [url, setUrl] = useState(entry ? entry.url ?? '' : '');
  const [category, setCategory] = useState(entry ? entry.category : (categories[0]?.slug || ''));
  const [icon, setIcon] = useState(entry ? entry.icon : 'Globe');

  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  
  const resetForm = useCallback(() => {
    const defaultCategory = categories[0]?.slug || '';
    if (!isEditing) {
        setServiceName('');
        setUsername('');
        setUrl('');
        setCategory(defaultCategory);
        setLength(16);
        setIncludeUppercase(true);
        setIncludeNumbers(true);
        setIncludeSymbols(true);
        setIcon('Globe');
        setPassword('');
    } else if (entry) {
        setServiceName(entry.serviceName);
        setUsername(entry.username);
        setUrl(entry.url ?? '');
        setCategory(entry.category);
        setPassword(entry.password);
        setIcon(entry.icon);
        setLength(entry.password.length);
    }
  }, [isEditing, entry, categories]);


  const generatePassword = useCallback(() => {
    const lowerCharset = 'abcdefghijklmnopqrstuvwxyz';
    const upperCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberCharset = '0123456789';
    const symbolCharset = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charset = lowerCharset;
    if (includeUppercase) charset += upperCharset;
    if (includeNumbers) charset += numberCharset;
    if (includeSymbols) charset += symbolCharset;

    if (charset.length === 0) {
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
    if (open && !isEditing) {
        generatePassword();
    }
    if (open) {
        resetForm();
    }
  }, [generatePassword, isEditing, open, resetForm]);

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast({
        title: 'Password Copied',
        description: 'The new password has been copied to your clipboard.',
      });
    }
  };

  const handleSave = async () => {
    if (!serviceName || !username || !password || !category) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }
    setIsSaving(true);
    let finalIcon = icon;
    if (url && (!isEditing || url !== entry?.url)) {
      try {
        const result = await getIconForUrl({ url });
        finalIcon = result.iconName;
      } catch (error) {
        console.error("Failed to get icon from AI", error);
        finalIcon = 'Globe';
      }
    }

    const newEntry = {
      serviceName,
      username,
      url,
      category,
      password,
      icon: finalIcon,
    };
    
    onAddEntry(newEntry);

    toast({
      title: isEditing ? 'Entry Updated' : 'Entry Added',
      description: `${serviceName} has been saved to your vault.`,
    });
    
    setIsSaving(false);
    setOpen(false);
  };
  
  useEffect(() => {
      if(!open) {
          resetForm();
      }
  }, [open, resetForm]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this entry.' : 'Create a strong, unique password for a new account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name</Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Google"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. google.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Generated Password</Label>
            <div className="relative">
              <Input
                id="password"
                value={password}
                readOnly
                className="pr-20 font-mono text-base"
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
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Include Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Include Symbols (!@#$..)</Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
