
'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EntryForm } from '@/components/dashboard/password-generator';
import { EntryCard } from '@/components/dashboard/password-card';
import { NotesView } from '@/components/dashboard/notes-view';
import type { VaultEntry } from '@/lib/data';
import { PlusCircle, Trash2, KeyRound, Lock, StickyNote } from 'lucide-react';
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
import { useVault } from '@/contexts/vaultContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { 
    entries, 
    categories, 
    loading,
    addCategory, 
    deleteCategory, 
    addEntry, 
    updateEntry, 
    deleteEntry 
  } = useVault();

  const [filteredEntries, setFilteredEntries] = useState<VaultEntry[]>([]);
  const [activeTab, setActiveTab] = useState('passwords');

  const categorySlug = params.category as string;
  const currentCategory = useMemo(() => categories.find(c => c.slug === categorySlug), [categories, categorySlug]);

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

  const handleDeleteCategoryAndRedirect = async (categoryId: string, categoryName: string) => {
    await deleteCategory(categoryId, categoryName);
    router.push('/dashboard/all');
  };

  const getPageTitle = () => {
    if (categorySlug === 'all') return 'All Vault Entries';
    return currentCategory ? currentCategory.name : 'Vault Entries';
  }

  const passwordEntries = filteredEntries.filter(e => e.type === 'password');
  const apiKeyEntries = filteredEntries.filter(e => e.type === 'apiKey');
  const noteEntries = filteredEntries.filter(e => e.type === 'note');

  const renderContent = () => {
    if (loading) {
        return (
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
        );
    }
    
    // Always show tabs for categories, even if empty.
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                onUpdateEntry={updateEntry}
                                onDeleteEntry={deleteEntry}
                                categories={categories}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">No Passwords In This Category</h3>
                        <p className="text-sm text-muted-foreground">
                            Click &quot;Add New&quot; to create your first password here.
                        </p>
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
                                onUpdateEntry={updateEntry}
                                onDeleteEntry={deleteEntry}
                                categories={categories}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">No API Keys In This Category</h3>
                        <p className="text-sm text-muted-foreground">
                            Click &quot;Add New&quot; to create your first API key here.
                        </p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="notes" className="pt-6">
                 <NotesView 
                    notes={noteEntries} 
                    categories={categories}
                    onAddEntry={addEntry}
                    onUpdateEntry={updateEntry}
                    onDeleteEntry={deleteEntry}
                    activeCategorySlug={categorySlug === 'all' ? undefined : categorySlug}
                />
            </TabsContent>
        </Tabs>
    );
  };


  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar categories={categories} onAddCategory={addCategory} loading={loading} />
      <div className="flex flex-col flex-1 sm:pl-[220px] lg:pl-[280px]">
        <Header categories={categories} onAddCategory={addCategory} loading={loading} />
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
                                        onClick={() => handleDeleteCategoryAndRedirect(currentCategory.id, currentCategory.name)}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <EntryForm 
                      onAddEntry={addEntry} 
                      onUpdateEntry={updateEntry} 
                      categories={categories}
                      activeCategorySlug={categorySlug === 'all' ? undefined : categorySlug}
                    >
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                      </Button>
                    </EntryForm>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(CategoryPage);
