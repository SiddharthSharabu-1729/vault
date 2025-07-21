
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Save, LoaderCircle, KeyRound, Lock, StickyNote, FileKey } from 'lucide-react';
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
import type { VaultEntry, Category, EntryType } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getIconForKeyword } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';
import { doVerifyPassword } from '@/services/auth';


interface EntryFormProps {
  children: React.ReactNode;
  onAddEntry: (newEntry: Omit<VaultEntry, 'id'>, masterPassword: string) => void;
  onUpdateEntry: (updatedEntry: VaultEntry, masterPassword?: string) => void;
  entry?: VaultEntry;
  categories: Category[];
  activeCategorySlug?: string;
}

export function EntryForm({
  children,
  onAddEntry,
  onUpdateEntry,
  entry,
  categories,
  activeCategorySlug
}: EntryFormProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!entry;

  // Entry type
  const [entryType, setEntryType] = useState<EntryType>('password');

  // Generator settings
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [masterPassword, setMasterPassword] = useState('');

  // State trackers
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [apiKeyChanged, setApiKeyChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  
  const initializeForm = useCallback(() => {
    const type = entry?.type ?? 'password';
    setEntryType(type);
    setTitle(entry?.title ?? '');
    setUsername(entry?.username ?? '');
    setUrl(entry?.url ?? '');
    setNotes(entry?.notes ?? '');
    setCategory(activeCategorySlug ?? entry?.category ?? (categories.length > 0 ? categories[0].slug : ''));
    setIcon(entry?.icon ?? 'Globe');

    // Reset sensitive fields
    setPassword('');
    setApiKey('');
    setMasterPassword('');

    setPasswordChanged(false); 
    setApiKeyChanged(false);
    
    // Reset generator settings
    setLength(16);
    setIncludeUppercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);

    if (!isEditing && type === 'password') {
      setPasswordChanged(true);
    }
  }, [entry, isEditing, categories, activeCategorySlug]);


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
      toast({
        variant: 'destructive',
        title: 'Cannot Generate Password',
        description: 'Please select at least one character type.',
      });
      setPassword('');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    if (entryType === 'password') {
        setPasswordChanged(true);
    }
  }, [length, includeUppercase, includeNumbers, includeSymbols, toast, entryType]);
  
  useEffect(() => {
    if (open) {
      initializeForm();
    }
  }, [open, initializeForm]);
  
  // This hook now intelligently generates passwords only when appropriate.
  useEffect(() => {
    // Only generate if the form is open for a password entry
    if (open && entryType === 'password') {
      // If it's a new entry, generate one immediately.
      if (!isEditing) {
        generatePassword();
      }
    }
    // The dependency array ensures this runs whenever settings change,
    // but the logic inside prevents it from overwriting an edited password.
  }, [open, isEditing, entryType, length, includeUppercase, includeNumbers, includeSymbols, generatePassword]);


  const handleCopy = (text: string, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: `${type} Copied`,
        description: `The new ${type.toLowerCase()} has been copied to your clipboard.`,
      });
    }
  };

  const handleSave = async () => {
    if (!title || !category || !masterPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in Title, Category, and Master Password.',
      });
      return;
    }

    // Determine if validation is needed
    const needsValidation = !isEditing || 
                           (entryType === 'password' && passwordChanged) || 
                           (entryType === 'apiKey' && apiKeyChanged);

    setIsSaving(true);

    if (needsValidation) {
        try {
            await doVerifyPassword(masterPassword);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Master Password Invalid',
                description: 'The master password you entered is incorrect. Entry not saved.',
            });
            setIsSaving(false);
            return;
        }
    }
    
    let finalIcon = 'Globe';
    const searchString = url.trim() || title;

    if (entryType === 'password') {
        finalIcon = getIconForKeyword(searchString, 'Globe');
    } else if (entryType === 'note') {
        finalIcon = 'StickyNote';
    } else if (entryType === 'apiKey') {
        finalIcon = getIconForKeyword(searchString, 'FileKey');
    }

    const baseData = {
        title,
        category,
        url: url.trim(),
        icon: finalIcon,
        type: entryType,
    };
    
    let entryData: Omit<VaultEntry, 'id'>;
    let masterPassForUpdate: string | undefined = masterPassword;

    if (entryType === 'password') {
        if (!isEditing && !password) {
          toast({ variant: 'destructive', title: 'Missing Password', description: 'Please generate or enter a password.' });
          setIsSaving(false);
          return;
        }
        entryData = { ...baseData, username, password };
        if (!passwordChanged) masterPassForUpdate = undefined;
    } else if (entryType === 'note') {
        entryData = { ...baseData, notes };
        masterPassForUpdate = undefined; // Notes are not encrypted
    } else if (entryType === 'apiKey') {
         if (!isEditing && !apiKey) {
          toast({ variant: 'destructive', title: 'Missing API Key', description: 'Please enter an API key.' });
          setIsSaving(false);
          return;
        }
        entryData = { ...baseData, apiKey };
        if (!apiKeyChanged) masterPassForUpdate = undefined;
    } else {
        toast({ variant: 'destructive', title: 'Unknown Entry Type' });
        setIsSaving(false);
        return;
    }

    try {
        if (isEditing && entry) {
            const updatedEntryData: VaultEntry = {
                ...entry,
                ...baseData,
                username: entryType === 'password' ? username : entry.username,
                password: entryType === 'password' && passwordChanged ? password : entry.password,
                notes: entryType === 'note' ? notes : entry.notes,
                apiKey: entryType === 'apiKey' && apiKeyChanged ? apiKey : entry.apiKey,
            };
            await onUpdateEntry(updatedEntryData, masterPassForUpdate);
        } else {
            await onAddEntry(entryData, masterPassword);
        }
    } catch(e) {
      // The parent component handles the success/fail toast.
    } finally {
        setIsSaving(false);
        setOpen(false);
    }
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordChanged(true);
  }

  const handleApiKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setApiKeyChanged(true);
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${entry?.type}` : 'Add New Entry'}</DialogTitle>
          <DialogDescription>
             {isEditing ? `Update the details for this ${entry?.type}.` : 'Securely save a password, note, or API key.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={entryType} onValueChange={(v) => setEntryType(v as EntryType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3" style={{ pointerEvents: isEditing ? 'none' : 'auto' }}>
                <TabsTrigger value="password"><Lock className="mr-2 h-4 w-4" />Password</TabsTrigger>
                <TabsTrigger value="note"><StickyNote className="mr-2 h-4 w-4"/>Note</TabsTrigger>
                <TabsTrigger value="apiKey"><FileKey className="mr-2 h-4 w-4" />API Key</TabsTrigger>
            </TabsList>

            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={entryType === 'password' ? "e.g. Google" : entryType === 'note' ? "e.g. Shopping List" : "e.g. OpenAI API"}
                    />
                </div>
                
                <TabsContent value="password" className="space-y-4 m-0">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username / Email</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. user@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="url">URL (optional)</Label>
                        <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. google.com"/>
                    </div>
                    <div className="space-y-2">
                        <Label>{isEditing && !passwordChanged ? 'New Password (Optional)' : 'Password'}</Label>
                        <div className="relative">
                        <Input id="password" value={password} onChange={handlePasswordInputChange} placeholder={isEditing ? 'Enter to change' : 'Enter or generate'} className="pr-20 font-mono text-base" />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <Button type="button" variant="ghost" size="icon" onClick={generatePassword}><RefreshCw className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(password, 'Password')}><Copy className="h-4 w-4" /></Button>
                        </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="length">Password Length</Label>
                            <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm font-medium text-muted-foreground">{length}</span>
                        </div>
                        <Slider id="length" max={64} min={8} step={1} value={[length]} onValueChange={(value) => setLength(value[0])}/>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                            <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                            <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="symbols">Include Symbols (!@#$..)</Label>
                            <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols}/>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="note" className="space-y-4 m-0">
                     <div className="space-y-2">
                        <Label htmlFor="notes">Content</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Type your secure note here..." className="min-h-[200px]" />
                    </div>
                </TabsContent>

                <TabsContent value="apiKey" className="space-y-4 m-0">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">{isEditing && !apiKeyChanged ? 'New API Key (Optional)' : 'API Key'}</Label>
                        <div className="relative">
                            <Input id="apiKey" value={apiKey} onChange={handleApiKeyInputChange} placeholder={isEditing ? "Enter to change key" : "Enter your API key"} className="pr-10 font-mono text-base" />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(apiKey, 'API Key')}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="api-url">Related URL (optional)</Label>
                        <Input id="api-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. openai.com"/>
                    </div>
                </TabsContent>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" disabled={categories.length === 0}><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
                    </SelectContent>
                    </Select>
                </div>
            
                <div className="space-y-2 pt-4">
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Master Password Required</AlertTitle>
                        <AlertDescription>
                            Enter your master password to encrypt and save this entry securely.
                        </AlertDescription>
                    </Alert>
                    <Label htmlFor="master-password">Master Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="master-password" type="password" required className="pl-10" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} />
                    </div>
                </div>
            </div>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4" />)}
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
