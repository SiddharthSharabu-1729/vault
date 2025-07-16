'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, LoaderCircle, LayoutGrid, PlusCircle, type Icon } from 'lucide-react';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { doSignOut } from '@/services/auth';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/authContext';
import { getCategories, addCategory } from '@/services/firestore';
import { CategoryCreator } from './category-creator';
import { useToast } from '@/hooks/use-toast';

export function Sidebar() {
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
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load categories.',
        });
    } finally {
        setLoadingCategories(false);
    }
  }, [currentUser, toast]);

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
      fetchCategories(); // Re-fetch categories to show the new one
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
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-[220px] flex-col border-r bg-background sm:flex lg:w-[280px]">
      <div className="flex flex-col flex-grow">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="">Fortress Vault</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <div className="mb-2">
              <CategoryCreator onAddCategory={handleAddCategory}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Category
                  </Button>
              </CategoryCreator>
          </div>
          {loadingCategories ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 animate-pulse">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
             ))
          ) : (
            allCategories.map((category) => {
                const href = `/dashboard/${category.slug === 'all' ? '' : category.slug}`;
                const isActive = (pathname === '/dashboard' && category.slug === 'all') || pathname.endsWith(`/${category.slug}`);
                const IconComponent = (iconMap[category.icon] || LayoutGrid) as Icon;

                return (
                    <Link
                    key={category.slug}
                    href={href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                        isActive && 'bg-muted text-primary'
                    )}
                    >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                    </Link>
                )
            })
          )}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
            <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start" disabled={isLoggingOut}>
              {isLoggingOut ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
