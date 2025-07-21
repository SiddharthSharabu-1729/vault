
'use client';

import { useState } from 'react';
import { Copy, Edit, MoreVertical, Trash2, Globe, Check, Eye, EyeOff, KeyRound, LoaderCircle } from 'lucide-react';
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

import type { PasswordEntry, Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PasswordGenerator } from './password-generator';
import { decryptPassword } from '@/services/crypto';


interface PasswordCardProps {
  entry: PasswordEntry;
  onUpdateEntry: (updatedEntry: PasswordEntry, masterPassword?: string) => void;
  onDeleteEntry: (id: string) => void;
  categories: Category[];
}

export function PasswordCard({ entry, onUpdateEntry, onDeleteEntry, categories }: PasswordCardProps) {
  const { toast } = useToast();
  const IconComponent = (iconMap[entry.icon] || Globe) as Icon;
  
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDecryptDialog, setShowDecryptDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);


  const handleCopy = () => {
    if (!decryptedPassword) {
      toast({
        variant: 'destructive',
        title: 'Password not revealed',
        description: 'Please reveal the password before copying.',
      });
      return;
    }
    navigator.clipboard.writeText(decryptedPassword);
    setCopied(true);
    toast({
      title: 'Password Copied',
      description: `Password for ${entry.serviceName} has been copied to your clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTogglePasswordVisibility = () => {
    if (decryptedPassword) {
      setDecryptedPassword('');
    } else {
      setShowDecryptDialog(true);
    }
  };

  const handleDecrypt = async () => {
    if (!masterPassword) {
      toast({ variant: 'destructive', title: 'Master password is required' });
      return;
    }
    setIsDecrypting(true);
    try {
      const plainText = await decryptPassword(entry.password, masterPassword);
      setDecryptedPassword(plainText);
      setShowDecryptDialog(false);
      setMasterPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Decryption Failed',
        description: error.message || 'Could not decrypt the password. Please check your master password.',
      });
    } finally {
      setIsDecrypting(false);
    }
  };
  
  const handleUpdate = (updatedEntryData: Omit<PasswordEntry, 'id'>, masterPass?: string) => {
    onUpdateEntry({ ...updatedEntryData, id: entry.id }, masterPass);
  };


  return (
    <>
      <Card className="flex flex-col transition-all hover:shadow-md">
        <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <IconComponent className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{entry.serviceName}</CardTitle>
            <CardDescription>{entry.username}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PasswordGenerator onAddEntry={()=>{}} onUpdateEntry={handleUpdate} entry={entry} categories={categories}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </PasswordGenerator>
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
                      <span className="font-semibold"> {entry.serviceName}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteEntry(entry.id)}
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
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <button onClick={handleTogglePasswordVisibility} className="flex-1 text-left">
                  {decryptedPassword ? (
                      <span className="font-mono text-sm tracking-wider text-foreground">{decryptedPassword}</span>
                  ) : (
                      <span className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</span>
                  )}
              </button>
              <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTogglePasswordVisibility}>
                      {decryptedPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{decryptedPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy password</span>
                  </Button>
              </div>
          </div>
        </CardContent>
        {entry.url && (
          <CardFooter>
              <a
              href={`https://${entry.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
              >
              {entry.url}
              </a>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showDecryptDialog} onOpenChange={setShowDecryptDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Unlock Password</DialogTitle>
                <DialogDescription>
                    Enter your master password to reveal the password for {entry.serviceName}.
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
                            onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
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
    </>
  );
}
