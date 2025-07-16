'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, LoaderCircle, LayoutGrid, PlusCircle, type Icon } from 'lucide-react';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { doSignOut } from '@/services/auth';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/authContext';
import { getCategories, addCategory } from '@/services/firestore';
import { CategoryCreator } from './category-creator';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './theme-toggle';


export function SidebarMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!currentUser) return;
    setLoadingCategories(true);
    try {
        const userCategories = await getCategories(currentUser.uid);
        setCategories(userCategories);
    } catch(error) {
        console.error("Error fetching categories:", error);
    } finally {
        setLoadingCategories(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        fetchCategories();
    }
  }, [currentUser, fetchCategories]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await doSignOut();
    router.push('/');
  };

  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    if (!currentUser) return;
    try {
      await addCategory(currentUser.uid, newCategoryData);
      toast({
          title: 'Category Created',
          description: `${newCategoryData.name} has been added.`,
      });
      fetchCategories();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new category.',
      });
    }
  };


  const allCategories = [{ name: 'All Entries', slug: 'all', icon: 'LayoutGrid' }, ...categories];


  return (
    <nav className="grid gap-6 text-lg font-medium">
        <Link
            href="/dashboard"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
            <ShieldCheck className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Fortress Vault</span>
        </Link>
        
        <div className="px-2.5">
            <CategoryCreator onAddCategory={handleAddCategory}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Category
                </Button>
            </CategoryCreator>
        </div>

        {loadingCategories ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-2.5 animate-pulse">
                    <div className="h-5 w-5 bg-muted rounded" />
                    <div className="h-5 w-2/3 bg-muted rounded" />
                </div>
             ))
        ) : (
        allCategories.map((category) => {
            const IconComponent = (iconMap[category.icon] || LayoutGrid) as Icon;
            return (
            <Link
                key={category.slug}
                href={`/dashboard/${category.slug === 'all' ? '' : category.slug}`}
                className={cn(
                'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                (pathname === `/dashboard` && category.slug === 'all') || pathname === `/dashboard/${category.slug}` ? 'text-foreground' : ''
                )}
            >
                <IconComponent className="h-5 w-5" />
                {category.name}
            </Link>
            )
        })
        )}
        <div className="absolute bottom-4 left-4">
            <div className="flex items-center justify-between">
                <Button onClick={handleLogout} variant="ghost" size="sm" className="justify-start" disabled={isLoggingOut}>
                {isLoggingOut ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
                <ThemeToggle />
            </div>
        </div>
    </nav>
  );
}
