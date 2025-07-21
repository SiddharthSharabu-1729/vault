
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EntryForm } from '@/components/dashboard/password-generator';
import { EntryCard } from '@/components/dashboard/password-card';
import type { VaultEntry, Category } from '@/lib/data';
import { PlusCircle, LoaderCircle, Trash2, KeyRound, Lock, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/authContext';
import { getEntries, addEntry, updateEntry, deleteEntry, getCategories, addCategory, deleteCategory, addActivityLog } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const runtime = 'edge';

function CategoryPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<VaultEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const categorySlug = params.category as string;
  const currentCategory = categories.find(c => c.slug === categorySlug);

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
        title: 'Error Fetching Data',
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
        entry.title.toLowerCase().includes(searchTerm) ||
        (entry.username && entry.username.toLowerCase().includes(searchTerm));
      return inCategory && inSearch;
    });

    setFilteredEntries(newFilteredEntries);
  }, [categorySlug, entries, searchParams]);
  
  const handleAddCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    try {
      await addCategory(newCategoryData);
      await addActivityLog('Category Created', `New category "${newCategoryData.name}" was added.`);
      toast({
          title: 'Category Created',
          description: `${newCategoryData.name} has been successfully added.`,
      });
      await fetchAllData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        variant: 'destructive',
        title: 'Category Creation Failed',
        description: 'Failed to create the new category. Please try again.',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
        await deleteCategory(categoryId);
        await addActivityLog('Category Deleted', `The "${categoryName}" category and all its entries were deleted.`);
        toast({
            title: 'Category Deleted',
            description: `The "${categoryName}" category has been deleted.`,
        });
        router.push('/dashboard/all');
        // No need to call fetchAllData here as we are navigating away
    } catch (error) {
        console.error("Error deleting category:", error);
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'Failed to delete the category. Please try again.',
        });
    }
  };

  const handleAddEntry = async (newEntryData: Omit<VaultEntry, 'id'>, masterPassword: string) => {
    try {
      await addEntry(newEntryData, masterPassword);
      await addActivityLog('Entry Added', `New ${newEntryData.type} entry "${newEntryData.title}" was created.`);
      toast({
        title: 'Entry Added',
        description: `${newEntryData.title} has been saved to your vault.`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the new entry. Please try again.',
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: VaultEntry, masterPassword?: string) => {
    try {
      await updateEntry(updatedEntry.id, updatedEntry, masterPassword);
      await addActivityLog('Entry Updated', `The ${updatedEntry.type} entry "${updatedEntry.title}" was updated.`);
       toast({
        title: 'Entry Updated',
        description: `${updatedEntry.title} has been successfully updated.`,
      });
       await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the entry. Please try again.',
      });
    }
  };

  const handleDeleteEntry = async (id: string, title: string, type: string) => {
    try {
      await deleteEntry(id);
      await addActivityLog('Entry Deleted', `The ${type} entry "${title}" was deleted.`);
       toast({
        title: 'Entry Deleted',
        description: `The entry has been removed from your vault.`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the entry. Please try again.',
      });
    }
  };

  const getPageTitle = () => {
    if (categorySlug === 'all') return 'All Vault Entries';
    return currentCategory ? currentCategory.name : 'Vault Entries';
  }

  const passwordEntries = filteredEntries.filter(e => e.type === 'password');
  const apiKeyEntries = filteredEntries.filter(e => e.type === 'apiKey');
  const noteEntries = filteredEntries.filter(e => e.type === 'note');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar categories={categories} onAddCategory={handleAddCategory} loading={pageLoading} />
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
                      Manage your saved passwords, notes, and API keys.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {categorySlug !== 'all' && currentCategory && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Category
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete &quot;{currentCategory.name}&quot;?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this
                                        category and all entries within it.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteCategory(currentCategory.id, currentCategory.name)}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <EntryForm onAddEntry={handleAddEntry} onUpdateEntry={handleUpdateEntry} categories={categories}>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                      </Button>
                    </EntryForm>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pageLoading ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-2/3" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  </div>
                ) : filteredEntries.length > 0 ? (
                    <Tabs defaultValue="passwords" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="passwords"><Lock className="mr-2 h-4 w-4" /> Passwords ({passwordEntries.length})</TabsTrigger>
                            <TabsTrigger value="apiKeys"><KeyRound className="mr-2 h-4 w-4" /> API Keys ({apiKeyEntries.length})</TabsTrigger>
                            <TabsTrigger value="notes"><StickyNote className="mr-2 h-4 w-4" /> Notes ({noteEntries.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="passwords" className="pt-6">
                            {passwordEntries.length > 0 ? (
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
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-muted-foreground">No passwords in this category.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="apiKeys" className="pt-6">
                            {apiKeyEntries.length > 0 ? (
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
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-muted-foreground">No API keys in this category.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="notes" className="pt-6">
                            {noteEntries.length > 0 ? (
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
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-muted-foreground">No secure notes in this category.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No Entries In This Category</h3>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add New&quot; to create your first entry here.
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
