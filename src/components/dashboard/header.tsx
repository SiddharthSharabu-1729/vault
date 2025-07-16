'use client';

import {
  Menu,
  Search,
} from 'lucide-react';
import type { Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { SidebarMobile } from './sidebar-mobile';

interface HeaderProps {
    categories: Category[];
    onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
    loading: boolean;
}

export function Header({ categories, onAddCategory, loading }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sticky top-0 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
           <SidebarMobile 
              categories={categories}
              onAddCategory={onAddCategory}
              loading={loading}
           />
        </SheetContent>
      </Sheet>
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search entries..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          onChange={handleSearch}
          defaultValue={searchParams.get('q') ?? ''}
        />
      </div>
      <div className="ml-auto">
         <ThemeToggle />
      </div>
    </header>
  );
}
