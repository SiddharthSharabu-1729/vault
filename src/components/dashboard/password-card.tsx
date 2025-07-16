'use client';

import { useState } from 'react';
import { Copy, Edit, MoreVertical, Trash2, Globe, Check, Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

import type { PasswordEntry } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PasswordGenerator } from './password-generator';

const iconMap: { [key: string]: LucideIcon } = {
  Globe: Globe,
};

interface PasswordCardProps {
  entry: PasswordEntry;
  onUpdateEntry: (updatedEntry: PasswordEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export function PasswordCard({ entry, onUpdateEntry, onDeleteEntry }: PasswordCardProps) {
  const { toast } = useToast();
  const IconComponent = iconMap[entry.icon] || Globe;
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.password);
    setCopied(true);
    toast({
      title: 'Password Copied',
      description: `Password for ${entry.serviceName} has been copied to your clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleUpdate = (updatedEntry: Omit<PasswordEntry, 'id'>) => {
    onUpdateEntry({ ...updatedEntry, id: entry.id });
  };


  return (
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
            <PasswordGenerator onAddEntry={handleUpdate} entry={entry}>
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
            <button onClick={() => setShowPassword(!showPassword)} className="flex-1 text-left">
                {showPassword ? (
                    <span className="font-mono text-sm tracking-wider text-foreground">{entry.password}</span>
                ) : (
                    <span className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</span>
                )}
            </button>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
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
  );
}
