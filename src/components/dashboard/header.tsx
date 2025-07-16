'use client';

import Link from 'next/link';
import {
  Menu,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
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
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <ShieldCheck className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Fortress Vault</span>
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/dashboard/${category.slug === 'all' ? '' : category.slug}`}
                className={cn(
                  'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                  pathname === `/dashboard/${category.slug}` && 'text-foreground'
                )}
              >
                <category.icon className="h-5 w-5" />
                {category.name}
              </Link>
            ))}
             <div className="absolute bottom-4 left-4">
                <ThemeToggle />
             </div>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search entries..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <div className="ml-auto">
        {/* User menu can go here */}
      </div>
    </header>
  );
}
