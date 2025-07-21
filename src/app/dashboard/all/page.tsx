
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntryForm } from '@/components/dashboard/password-generator';
import { EntryCard } from '@/components/dashboard/password-card';
import type { VaultEntry, Category } from '@/lib/data';
import { PlusCircle, LoaderCircle, KeyRound, Lock, StickyNote } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

function AllEntriesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<VaultEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const searchParams = useSearchParams();

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
      const inSearch =
        searchTerm === '' ||
        entry.title.toLowerCase().includes(searchTerm) ||
        (entry.username && entry.username.toLowerCase().includes(searchTerm));
      return inSearch;
    });

    setFilteredEntries(newFilteredEntries);
  }, [entries, searchParams]);
  
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

  const handleAddEntry = async (newEntryData: Omit<VaultEntry, 'id'>, masterPassword: string) => {
    try {
      await addEntry(newEntryData, masterPassword);
      toast({
        title: 'Entry Added',
        description: `${newEntryData.title} has been saved to your vault.`,
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

  const handleUpdateEntry = async (updatedEntry: VaultEntry, masterPassword?: string) => {
    try {
      await updateEntry(updatedEntry.id, updatedEntry, masterPassword);
       toast({
        title: 'Entry Updated',
        description: `${updatedEntry.title} has been updated.`,
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

  const passwordEntries = filteredEntries.filter(e => e.type === 'password');
  const apiKeyEntries = filteredEntries.filter(e => e.type === 'apiKey');
  const noteEntries = filteredEntries.filter(e => e.type === 'note');

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Vault Entries</CardTitle>
                    <CardDescription>
                      Manage your saved passwords, notes, and API keys.
                    </CardDescription>
                  </div>
                  <EntryForm onAddEntry={handleAddEntry} onUpdateEntry={handleUpdateEntry} categories={categories}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </EntryForm>
                </div>
              </CardHeader>
              <CardContent>
                {pageLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredEntries.length > 0 ? (
                  <div className="space-y-8">
                    {passwordEntries.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold flex items-center mb-4"><Lock className="mr-3 h-5 w-5 text-muted-foreground"/> Passwords</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {passwordEntries.map((entry) => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              onUpdateEntry={handleUpdateEntry}
                              onDeleteEntry={handleDeleteEntry}
                              categories={categories}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                     {apiKeyEntries.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold flex items-center mb-4"><KeyRound className="mr-3 h-5 w-5 text-muted-foreground"/> API Keys</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {apiKeyEntries.map((entry) => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              onUpdateEntry={handleUpdateEntry}
                              onDeleteEntry={handleDeleteEntry}
                              categories={categories}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                     {noteEntries.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold flex items-center mb-4"><StickyNote className="mr-3 h-5 w-5 text-muted-foreground"/> Secure Notes</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {noteEntries.map((entry) => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              onUpdateEntry={handleUpdateEntry}
                              onDeleteEntry={handleDeleteEntry}
                              categories={categories}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No entries yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add New&quot; to secure your first item.
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

export default withAuth(AllEntriesPage);
