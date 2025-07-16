'use client';

import { Copy, Edit, MoreVertical, Trash2 } from 'lucide-react';
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
import type { PasswordEntry } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface PasswordCardProps {
  entry: PasswordEntry;
}

export function PasswordCard({ entry }: PasswordCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText('••••••••••••'); // In a real app, copy the actual password
    toast({
      title: 'Password Copied',
      description: `Password for ${entry.serviceName} has been copied to your clipboard.`,
    });
  };

  return (
    <Card className="flex flex-col transition-all hover:shadow-md">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <entry.icon className="h-6 w-6 text-muted-foreground" />
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
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
          <span className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy password</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href={`https://${entry.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {entry.url}
        </a>
      </CardFooter>
    </Card>
  );
}
