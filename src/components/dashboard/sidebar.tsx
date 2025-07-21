
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LoaderCircle, LayoutGrid, PlusCircle, LogOut, User as UserIcon, Settings, type Icon } from 'lucide-react';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CategoryCreator } from './category-creator';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/services/auth';
import { addActivityLog } from '@/services/firestore';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';

interface SidebarProps {
    categories: Category[];
    onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
    loading: boolean;
}

export function Sidebar({ categories, onAddCategory, loading }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
        await addActivityLog('User Logged Out', `User ${currentUser?.email} logged out.`);
        await doSignOut();
        router.push('/');
    } catch (error) {
        console.error('Logout failed:', error);
        setIsLoggingOut(false);
    }
  };

  const allCategories = [{ name: 'All Entries', slug: 'all', icon: 'LayoutGrid' }, ...categories];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-[220px] flex-col border-r bg-muted/40 sm:flex lg:w-[280px]">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard/all" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="">Fortress Vault</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-2">
            <CategoryCreator onAddCategory={onAddCategory}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Category
                </Button>
            </CategoryCreator>
        </div>
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 animate-pulse">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-3/4 rounded-sm" />
              </div>
           ))
        ) : (
          allCategories.map((category) => {
              const href = `/dashboard/${category.slug}`;
              const isActive = pathname === href;
              const IconComponent = (iconMap[category.icon] || LayoutGrid) as Icon;
              
              return (
                <div key={category.slug} className="relative group/item">
                    <Link
                      href={href}
                      className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-muted',
                          isActive && 'bg-muted text-primary font-semibold'
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.name}
                    </Link>
                </div>
              )
          })
        )}
      </nav>
      <div className="mt-auto border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium leading-none text-foreground truncate max-w-[150px]">
                            {currentUser?.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Account Settings
                        </span>
                    </div>
                  </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-between" onSelect={e => e.preventDefault()}>
                    <span>Theme</span>
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings & Activity</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
