'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, LoaderCircle, LayoutGrid, PlusCircle, type Icon } from 'lucide-react';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { doSignOut } from '@/services/auth';
import React, { useState } from 'react';
import { CategoryCreator } from './category-creator';
import { ThemeToggle } from './theme-toggle';

interface SidebarMobileProps {
  categories: Category[];
  onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
  loading: boolean;
}

export function SidebarMobile({ categories, onAddCategory, loading }: SidebarMobileProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await doSignOut();
    router.push('/');
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
            <CategoryCreator onAddCategory={onAddCategory}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Category
                </Button>
            </CategoryCreator>
        </div>

        {loading ? (
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
