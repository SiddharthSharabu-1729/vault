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
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/authContext';
import { getEntries, addEntry, updateEntry, deleteEntry, getCategories } from '@/services/firestore';
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

  const handleAddEntry = async (newEntryData: Omit<PasswordEntry, 'id'>) => {
    if (!currentUser) return;
    try {
      const newEntry = await addEntry(currentUser.uid, newEntryData);
      setEntries((prev) => [newEntry, ...prev]);
      // Also refetch categories in case a new one was implicitly used
      const userCategories = await getCategories(currentUser.uid);
      setCategories(userCategories);
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
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      );
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
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
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

  const handleCategoryCreated = async () => {
    if (!currentUser) return;
    const userCategories = await getCategories(currentUser.uid);
    setCategories(userCategories);
  };


  return (
    <>
      <Header categories={categories} onCategoryCreated={handleCategoryCreated} />
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
    </>
  );
}

export default withAuth(DashboardPage);