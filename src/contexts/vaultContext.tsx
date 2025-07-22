
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { VaultEntry, Category } from '@/lib/data';
import * as firestore from '@/services/firestore';
import { addActivityLog } from '@/services/auth';
import { useAuth } from './authContext';
import { useToast } from '@/hooks/use-toast';

interface VaultContextType {
  entries: VaultEntry[];
  categories: Category[];
  loading: boolean;
  fetchAllData: () => Promise<void>;
  addEntry: (newEntryData: Omit<VaultEntry, 'id'>, masterPassword: string) => Promise<void>;
  updateEntry: (updatedEntry: VaultEntry, masterPassword?: string) => Promise<void>;
  deleteEntry: (id: string, title: string, type: string) => Promise<void>;
  addCategory: (newCategoryData: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (categoryId: string, categoryName: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [userEntries, userCategories] = await Promise.all([
        firestore.getEntries(),
        firestore.getCategories(),
      ]);
      setEntries(userEntries);
      setCategories(userCategories);
    } catch (error) {
      console.error("Error fetching vault data:", error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Data',
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

  const addEntry = async (newEntryData: Omit<VaultEntry, 'id'>, masterPassword: string) => {
    try {
      const newEntry = await firestore.addEntry(newEntryData, masterPassword);
      setEntries(prev => [...prev, newEntry]);
      await addActivityLog('Entry Added', `New ${newEntryData.type} entry "${newEntryData.title}" was created.`);
      toast({
        title: 'Entry Added',
        description: `${newEntryData.title} has been saved to your vault.`,
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the new entry. Please try again.',
      });
      throw error; // Re-throw to be caught by caller if needed
    }
  };

  const updateEntry = async (updatedEntry: VaultEntry, masterPassword?: string) => {
    try {
      await firestore.updateEntry(updatedEntry.id, updatedEntry, masterPassword);
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      await addActivityLog('Entry Updated', `The ${updatedEntry.type} entry "${updatedEntry.title}" was updated.`);
      toast({
        title: 'Entry Updated',
        description: `${updatedEntry.title} has been successfully updated.`,
      });
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the entry. Please try again.',
      });
      throw error;
    }
  };

  const deleteEntry = async (id: string, title: string, type: string) => {
    try {
      await firestore.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      await addActivityLog('Entry Deleted', `The ${type} entry "${title}" was deleted.`);
      toast({
        title: 'Entry Deleted',
        description: `The entry has been removed from your vault.`,
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the entry. Please try again.',
      });
      throw error;
    }
  };

  const addCategory = async (newCategoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = await firestore.addCategory(newCategoryData);
      setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
      await addActivityLog('Category Created', `New category "${newCategoryData.name}" was added.`);
      toast({
        title: 'Category Created',
        description: `${newCategoryData.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        variant: 'destructive',
        title: 'Category Creation Failed',
        description: error.message || 'Failed to create the new category. Please try again.',
      });
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      // Find all entries in this category before deleting
      const categoryToDelete = categories.find(c => c.id === categoryId);
      if (!categoryToDelete) throw new Error("Category not found");
      
      const entriesToDelete = entries.filter(e => e.category === categoryToDelete.slug).map(e => e.id);

      await firestore.deleteCategory(categoryId);

      // Update local state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setEntries(prev => prev.filter(e => !entriesToDelete.includes(e.id)));

      await addActivityLog('Category Deleted', `The "${categoryName}" category and all its entries were deleted.`);
      toast({
        title: 'Category Deleted',
        description: `The "${categoryName}" category has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Failed to delete the category. Please try again.',
      });
      throw error;
    }
  };


  const value = {
    entries,
    categories,
    loading,
    fetchAllData,
    addEntry,
    updateEntry,
    deleteEntry,
    addCategory,
    deleteCategory,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}
