'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PasswordGenerator } from '@/components/dashboard/password-generator';
import { PasswordCard } from '@/components/dashboard/password-card';
import { passwordEntries as initialPasswordEntries } from '@/lib/data';
import type { PasswordEntry } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Header } from '@/components/dashboard/header';


export default function DashboardPage() {
  const [entries, setEntries] = useState<PasswordEntry[]>(initialPasswordEntries);
  const [filteredEntries, setFilteredEntries] = useState<PasswordEntry[]>(entries);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const category = pathname.split('/')[2] || 'all';
    const searchTerm = searchParams.get('q')?.toLowerCase() || '';

    const newFilteredEntries = entries.filter((entry) => {
      const inCategory = category === 'all' || entry.category === category;
      const inSearch =
        searchTerm === '' ||
        entry.serviceName.toLowerCase().includes(searchTerm) ||
        entry.username.toLowerCase().includes(searchTerm);
      return inCategory && inSearch;
    });

    setFilteredEntries(newFilteredEntries);
  }, [pathname, entries, searchParams]);


  const addEntry = (newEntry: Omit<PasswordEntry, 'id'>) => {
    const entry: PasswordEntry = { ...newEntry, id: Date.now().toString() };
    setEntries((prev) => [entry, ...prev]);
  };

  const updateEntry = (updatedEntry: PasswordEntry) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <>
    <Header />
    <main className="flex-1 p-4 sm:p-6">
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Vault Entries</CardTitle>
              <CardDescription>
                Manage your saved passwords and sensitive information.
              </CardDescription>
            </div>
            <PasswordGenerator onAddEntry={addEntry}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </PasswordGenerator>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEntries.map((entry) => (
                <PasswordCard
                  key={entry.id}
                  entry={entry}
                  onUpdateEntry={updateEntry}
                  onDeleteEntry={deleteEntry}
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
