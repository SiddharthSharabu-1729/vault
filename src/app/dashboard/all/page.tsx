
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntryForm } from '@/components/dashboard/password-generator';
import { EntryCard } from '@/components/dashboard/password-card';
import type { VaultEntry } from '@/lib/data';
import { PlusCircle, KeyRound, Lock } from 'lucide-react';
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
import { useVault } from '@/contexts/vaultContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

function AllEntriesPage() {
  const { 
    entries, 
    categories, 
    loading,
    addCategory, 
    addEntry, 
    updateEntry, 
    deleteEntry 
  } = useVault();

  const [filteredEntries, setFilteredEntries] = useState<VaultEntry[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchTerm = searchParams.get('q')?.toLowerCase() || '';

    const newFilteredEntries = entries.filter((entry) => {
      const isSearchable = entry.type === 'password' || entry.type === 'apiKey';
      const inSearch =
        searchTerm === '' ||
        entry.title.toLowerCase().includes(searchTerm) ||
        (entry.username && entry.username.toLowerCase().includes(searchTerm));
      return isSearchable && inSearch;
    });

    setFilteredEntries(newFilteredEntries);
  }, [entries, searchParams]);
  
  const passwordEntries = filteredEntries.filter(e => e.type === 'password');
  const apiKeyEntries = filteredEntries.filter(e => e.type === 'apiKey');

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
                    <CardTitle>All Vault Entries</CardTitle>
                    <CardDescription>
                      Manage your saved passwords and API keys.
                    </CardDescription>
                  </div>
                  <EntryForm onAddEntry={addEntry} onUpdateEntry={updateEntry} categories={categories}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </EntryForm>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-2/3" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  </div>
                ) : filteredEntries.length > 0 ? (
                    <Tabs defaultValue="passwords" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="passwords"><Lock className="mr-2 h-4 w-4" /> Passwords ({passwordEntries.length})</TabsTrigger>
                            <TabsTrigger value="apiKeys"><KeyRound className="mr-2 h-4 w-4" /> API Keys ({apiKeyEntries.length})</TabsTrigger>
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
                                    <p className="text-sm text-muted-foreground">No passwords found.</p>
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
                                    <p className="text-sm text-muted-foreground">No API keys found.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Your Vault is Empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add New&quot; to secure your first password or API key.
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
