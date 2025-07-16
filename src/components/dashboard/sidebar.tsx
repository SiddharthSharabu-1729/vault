'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LogOut } from 'lucide-react';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export function Sidebar() {
  const pathname = usePathname();

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
          {categories.map((category) => {
             const href = `/dashboard/${category.slug === 'all' ? '' : category.slug}`;
             const isActive = (pathname === '/dashboard' && category.slug === 'all') || pathname === href;
            return (
                <Link
                key={category.slug}
                href={href}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                    isActive && 'bg-muted text-primary'
                )}
                >
                <category.icon className="h-4 w-4" />
                {category.name}
                </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
