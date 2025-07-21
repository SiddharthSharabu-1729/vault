'use client';

import React, { useState, useCallback } from 'react';
import { Save, LoaderCircle, FolderPlus } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/data';
import { getIconForKeyword } from '@/lib/utils';

interface CategoryCreatorProps {
  children: React.ReactNode;
  onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
}

export function CategoryCreator({
  children,
  onAddCategory,
}: CategoryCreatorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setName('');
  }, []);

  const handleSave = async () => {
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Missing Field',
        description: 'Please provide a name for the category.',
      });
      return;
    }
    setIsSaving(true);
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const iconName = getIconForKeyword(name, 'Folder');

    const newCategory = {
      name,
      slug,
      icon: iconName,
    };
    
    onAddCategory(newCategory);
    
    setIsSaving(false);
    setOpen(false);
    resetForm();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Organize your vault with a new custom category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finances, Gaming"
            />
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
              <FolderPlus className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
