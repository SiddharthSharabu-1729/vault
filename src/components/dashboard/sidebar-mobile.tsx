
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutGrid, PlusCircle, type Icon } from 'lucide-react';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import React from 'react';
import { CategoryCreator } from './category-creator';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarMobileProps {
  categories: Category[];
  onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
  loading: boolean;
}

export function SidebarMobile({ categories, onAddCategory, loading }: SidebarMobileProps) {
  const pathname = usePathname();
  const allCategories = [{ name: 'All Entries', slug: 'all', icon: 'LayoutGrid' }, ...categories];

  return (
    <nav className="grid gap-6 text-lg font-medium mt-4">
        <Link
            href="/dashboard/all"
            className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base self-start"
        >
            <ShieldCheck className="h-6 w-6 transition-all group-hover:scale-110" />
            <span className="sr-only">Fortress Vault</span>
        </Link>
        
        <div className="flex flex-col gap-2">
            <CategoryCreator onAddCategory={onAddCategory}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground text-base">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Category
                </Button>
            </CategoryCreator>

            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-2.5 py-2 animate-pulse">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-5 w-2/3 rounded" />
                    </div>
                ))
            ) : (
            allCategories.map((category) => {
                const IconComponent = (iconMap[category.icon] || LayoutGrid) as Icon;
                const href = `/dashboard/${category.slug}`;
                const isActive = pathname === href;

                return (
                <Link
                    key={category.slug}
                    href={href}
                    className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-foreground',
                     isActive ? 'bg-muted text-foreground' : ''
                    )}
                >
                    <IconComponent className="h-5 w-5" />
                    {category.name}
                </Link>
                )
            })
            )}
        </div>
    </nav>
  );
}
