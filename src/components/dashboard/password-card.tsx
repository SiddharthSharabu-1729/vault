
'use client';

import { useState } from 'react';
import { Copy, Edit, MoreVertical, Trash2, Globe, Check, Eye, EyeOff, KeyRound, LoaderCircle, User, StickyNote, FileKey, CopyCheck } from 'lucide-react';
import type { Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { VaultEntry, Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { EntryForm } from './password-generator';
import { decryptPassword } from '@/services/crypto';
import { addActivityLog, doVerifyPassword } from '@/services/auth';


interface EntryCardProps {
  entry: VaultEntry;
  onUpdateEntry: (updatedEntry: VaultEntry, masterPassword?: string) => void;
  onDeleteEntry: (id: string, title: string, type: string) => void;
  categories: Category[];
}

export function EntryCard({ entry, onUpdateEntry, onDeleteEntry, categories }: EntryCardProps) {
  const { toast } = useToast();
  const IconComponent = (iconMap[entry.icon] || Globe) as Icon;
  
  const [decryptedValue, setDecryptedValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDecryptDialog, setShowDecryptDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);


  const handleCopy = (type: string) => {
    // If value is already revealed, copy it directly
    if (decryptedValue) {
        navigator.clipboard.writeText(decryptedValue);
        setCopied(true);
        toast({
            title: `${type} Copied`,
            description: `The ${type} for ${entry.title} has been copied to your clipboard.`,
        });
        setTimeout(() => setCopied(false), 2000);
    } else {
        // Otherwise, prompt for master password to decrypt and copy
        setShowCopyDialog(true);
    }
  };
  
  const handleToggleVisibility = () => {
    if (decryptedValue) {
      setDecryptedValue('');
    } else {
      setShowDecryptDialog(true);
    }
  };

  const handleDecrypt = async () => {
    if (!masterPassword) {
      toast({ variant: 'destructive', title: 'Master Password Required' });
      return;
    }
    setIsDecrypting(true);
    try {
      const encryptedValue = entry.type === 'password' ? entry.password : entry.apiKey;
      if (!encryptedValue) throw new Error("No value to decrypt");

      const plainText = await decryptPassword(encryptedValue, masterPassword);
      setDecryptedValue(plainText);
      setShowDecryptDialog(false);
      setMasterPassword('');
      await addActivityLog(`Entry Viewed`, `Revealed the ${entry.type} for "${entry.title}".`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Decryption Failed',
        description: error.message || `Could not decrypt the value. Please check your master password.`,
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!masterPassword) {
        toast({ variant: 'destructive', title: 'Master Password Required' });
        return;
    }
    setIsDecrypting(true);
    try {
        const encryptedValue = entry.type === 'password' ? entry.password : entry.apiKey;
        if (!encryptedValue) throw new Error("No value to copy");

        const plainText = await decryptPassword(encryptedValue, masterPassword);
        navigator.clipboard.writeText(plainText);
        
        toast({
            title: `${entry.type === 'password' ? 'Password' : 'API Key'} Copied`,
            description: `The value for ${entry.title} has been copied to your clipboard.`,
        });

        await addActivityLog('Entry Value Copied', `Copied the ${entry.type} for "${entry.title}".`);
        setShowCopyDialog(false);
        setMasterPassword('');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Copy Failed',
            description: error.message || `Could not copy the value. Please check your master password.`,
        });
    } finally {
        setIsDecrypting(false);
    }
  }
  
  const handleUpdate = (updatedEntryData: VaultEntry, masterPass?: string) => {
    onUpdateEntry(updatedEntryData, masterPass);
  };

  const renderCardContent = () => {
    switch (entry.type) {
      case 'password':
        return (
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <button onClick={handleToggleVisibility} className="flex-1 text-left">
                  {decryptedValue ? (
                      <span className="font-mono text-sm tracking-wider text-foreground">{decryptedValue}</span>
                  ) : (
                      <span className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</span>
                  )}
              </button>
              <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleVisibility}>
                      {decryptedValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{decryptedValue ? 'Hide password' : 'Show password'}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('Password')}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy password</span>
                  </Button>
              </div>
          </div>
        );
      case 'apiKey':
        return (
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <button onClick={handleToggleVisibility} className="flex-1 text-left truncate">
                {decryptedValue ? (
                    <span className="font-mono text-sm tracking-wider text-foreground">{decryptedValue}</span>
                ) : (
                    <span className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••••••••••</span>
                )}
            </button>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleVisibility}>
                    {decryptedValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{decryptedValue ? 'Hide API Key' : 'Show API Key'}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('API Key')}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy API Key</span>
                </Button>
            </div>
        </div>
        );
      case 'note':
        return (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words p-3 bg-muted rounded-md max-h-24 overflow-y-auto">
            {entry.notes}
          </div>
        )
      default:
        return null;
    }
  }

  const getCardDescription = () => {
    switch (entry.type) {
        case 'password':
            return <p className="flex items-center text-sm text-muted-foreground"><User className="w-3 h-3 mr-2"/> {entry.username}</p>;
        case 'apiKey':
            return <p className="flex items-center text-sm text-muted-foreground"><FileKey className="w-3 h-3 mr-2"/> API Key</p>;
        case 'note':
            return <p className="flex items-center text-sm text-muted-foreground"><StickyNote className="w-3 h-3 mr-2"/> Secure Note</p>;
        default:
            return null;
    }
  }

  return (
    <>
      <Card className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <IconComponent className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{entry.title}</CardTitle>
            <CardDescription>{getCardDescription()}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EntryForm onAddEntry={()=>{}} onUpdateEntry={handleUpdate} entry={entry} categories={categories}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </EntryForm>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onSelect={(e) => e.preventDefault()}
                  >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the entry for 
                      <span className="font-semibold"> {entry.title}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteEntry(entry.id, entry.title, entry.type)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1">
          {renderCardContent()}
        </CardContent>
        {entry.url && (
          <CardFooter>
              <a
              href={!entry.url.startsWith('http') ? `https://${entry.url}` : entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
              >
              {entry.url}
              </a>
          </CardFooter>
        )}
      </Card>

      {/* Decrypt and View Dialog */}
      <Dialog open={showDecryptDialog} onOpenChange={setShowDecryptDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Unlock Value</DialogTitle>
                <DialogDescription>
                    Enter your master password to reveal the value for {entry.title}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="master-password-decrypt">Master Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="master-password-decrypt"
                            type="password"
                            required
                            className="pl-10"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isDecrypting && handleDecrypt()}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isDecrypting}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleDecrypt} disabled={isDecrypting}>
                    {isDecrypting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    {isDecrypting ? 'Unlocking...' : 'Unlock'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decrypt and Copy Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Copy Value to Clipboard</DialogTitle>
                <DialogDescription>
                    Enter your master password to securely copy the value for {entry.title}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="master-password-copy">Master Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="master-password-copy"
                            type="password"
                            required
                            className="pl-10"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isDecrypting && handleCopyToClipboard()}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isDecrypting}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleCopyToClipboard} disabled={isDecrypting}>
                    {isDecrypting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CopyCheck className="mr-2 h-4 w-4" />}
                    {isDecrypting ? 'Copying...' : 'Copy to Clipboard'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
