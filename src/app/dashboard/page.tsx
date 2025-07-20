'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { getEntries, addEntry, updateEntry, deleteEntry, getCategories, addCategory } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

function DashboardPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [userEntries, userCategories] = await Promise.all([
        getEntries(currentUser.uid),
        getCategories(currentUser.uid),
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
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser, fetchAllData]);

  useEffect(() => {
    const categorySlug = pathname.split('/')[2] || 'all';
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
  }, [pathname, entries, searchParams]);
  
  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    if (!currentUser) return;
    try {
      await addCategory(currentUser.uid, newCategoryData);
      toast({
          title: 'Category Created',
          description: `${newCategoryData.name} has been added.`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new category.',
      });
    }
  };

  const handleAddEntry = async (newEntryData: Omit<PasswordEntry, 'id'>) => {
    if (!currentUser) return;
    try {
      await addEntry(currentUser.uid, newEntryData);
      toast({
        title: 'Entry Added',
        description: `${newEntryData.serviceName} has been saved to your vault.`,
      });
      await fetchAllData(); // Re-fetch all data to ensure consistency
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add new entry.',
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: PasswordEntry) => {
    if (!currentUser) return;
    const { id, ...dataToUpdate } = updatedEntry;
    try {
      await updateEntry(currentUser.uid, id, dataToUpdate);
       toast({
        title: 'Entry Updated',
        description: `${updatedEntry.serviceName} has been updated.`,
      });
       await fetchAllData(); // Re-fetch all data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update entry.',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteEntry(currentUser.uid, id);
       toast({
        title: 'Entry Deleted',
        description: `The entry has been removed from your vault.`,
      });
      await fetchAllData(); // Re-fetch to update the list
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete entry.',
      });
    }
  };

  const getPageTitle = () => {
    const categorySlug = pathname.split('/')[2];
    if (!categorySlug || categorySlug === 'all') return 'All Vault Entries';
    const category = categories.find(c => c.slug === categorySlug);
    return category ? category.name : 'Vault Entries';
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar categories={categories} onAddCategory={handleAddCategory} loading={loading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={handleAddCategory} loading={loading} />
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
                  <PasswordGenerator onAddEntry={handleAddEntry} categories={categories}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </PasswordGenerator>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
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
                    <h3 className="text-lg font-medium">No entries yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add New&quot; to secure your first password.
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

export default withAuth(DashboardPage);
