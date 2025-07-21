
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PasswordGenerator } from '@/components/dashboard/password-generator';
import { PasswordCard } from '@/components/dashboard/password-card';
import type { PasswordEntry, Category } from '@/lib/data';
import { PlusCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/authContext';
import { getEntries, addEntry, updateEntry, deleteEntry, getCategories, addCategory, deleteCategory } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


function CategoryPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<PasswordEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const categorySlug = params.category as string;

  const fetchAllData = async () => {
    if (!currentUser) return;

    setPageLoading(true);
    try {
      const [userEntries, userCategories] = await Promise.all([
        getEntries(),
        getCategories(),
      ]);
      setEntries(userEntries);
      setCategories(userCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: 'destructive',
        title: 'Error fetching data',
        description: 'Could not load your vault. Please try again later.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if(currentUser) {
        fetchAllData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const searchTerm = searchParams.get('q')?.toLowerCase() || '';

    const newFilteredEntries = entries.filter((entry) => {
      const inCategory = categorySlug === 'all' || entry.category === categorySlug;
      const inSearch =
        searchTerm === '' ||
        entry.serviceName.toLowerCase().includes(searchTerm) ||
        entry.username.toLowerCase().includes(searchTerm);
      return inCategory && inSearch;
    });

    setFilteredEntries(newFilteredEntries);
  }, [categorySlug, entries, searchParams]);
  
  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    try {
      await addCategory(newCategoryData);
      toast({
          title: 'Category Created',
          description: `${newCategoryData.name} has been added.`,
      });
      await fetchAllData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new category.',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
        await deleteCategory(categoryId);
        toast({
            title: 'Category Deleted',
            description: `The "${categoryName}" category and all its entries have been deleted.`,
        });
        router.push('/dashboard/all');
        await fetchAllData();
    } catch (error) {
        console.error("Error deleting category:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete category.',
        });
    }
  };

  const handleAddEntry = async (newEntryData: Omit<PasswordEntry, 'id'>, masterPassword: string) => {
    try {
      await addEntry(newEntryData, masterPassword);
      toast({
        title: 'Entry Added',
        description: `${newEntryData.serviceName} has been saved to your vault.`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add new entry.',
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: PasswordEntry, masterPassword?: string) => {
    const { id, ...dataToUpdate } = updatedEntry;
    try {
      await updateEntry(id, dataToUpdate, masterPassword);
       toast({
        title: 'Entry Updated',
        description: `${updatedEntry.serviceName} has been updated.`,
      });
       await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update entry.',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
       toast({
        title: 'Entry Deleted',
        description: `The entry has been removed from your vault.`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete entry.',
      });
    }
  };

  const getPageTitle = () => {
    if (categorySlug === 'all') return 'All Vault Entries';
    const category = categories.find(c => c.slug === categorySlug);
    return category ? category.name : 'Vault Entries';
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar categories={categories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} loading={pageLoading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{getPageTitle()}</CardTitle>
                    <CardDescription>
                      Manage your saved passwords and sensitive information.
                    </CardDescription>
                  </div>
                  <PasswordGenerator onAddEntry={handleAddEntry} onUpdateEntry={handleUpdateEntry} categories={categories}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </PasswordGenerator>
                </div>
              </CardHeader>
              <CardContent>
                {pageLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredEntries.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEntries.map((entry) => (
                      <PasswordCard
                        key={entry.id}
                        entry={entry}
                        onUpdateEntry={handleUpdateEntry}
                        onDeleteEntry={handleDeleteEntry}
                        categories={categories}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No entries in this category</h3>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add New&quot; to secure your first password in here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(CategoryPage);
