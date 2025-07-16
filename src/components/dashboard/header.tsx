'use client';

import Link from 'next/link';
import {
  Menu,
  Search,
  ShieldCheck,
  LayoutGrid,
  PlusCircle,
} from 'lucide-react';
import type { Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { CategoryCreator } from './category-creator';
import { useAuth } from '@/contexts/authContext';
import { addCategory } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
    categories: Category[];
    onCategoryCreated: () => void;
}

export function Header({ categories, onCategoryCreated }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    if (!currentUser) return;
    try {
      await addCategory(currentUser.uid, newCategoryData);
      toast({
          title: 'Category Created',
          description: `${newCategoryData.name} has been added.`,
      });
      onCategoryCreated();
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
            
            <div className="px-2.5">
              <CategoryCreator onAddCategory={handleAddCategory}>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Category
                  </Button>
              </CategoryCreator>
            </div>

            {allCategories.map((category) => {
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
            })}
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
          onChange={handleSearch}
          defaultValue={searchParams.get('q') ?? ''}
        />
      </div>
      <div className="ml-auto">
        {/* User menu can go here */}
      </div>
    </header>
  );
}
