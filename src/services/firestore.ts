'use server';

import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import type { PasswordEntry } from '@/lib/data';
import { defaultCategories } from '@/lib/data';
import type { Category } from '@/lib/data';

// == CATEGORY FUNCTIONS ==

export async function createDefaultCategories(userId: string) {
    const batch = writeBatch(db);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    
    defaultCategories.forEach(category => {
        const newCategoryRef = doc(categoriesCollection);
        batch.set(newCategoryRef, category);
    });

    await batch.commit();
}

export async function getCategories(userId: string): Promise<Category[]> {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
        console.error("Attempted to get categories with mismatched or no user ID.");
        return [];
    }
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const categorySnapshot = await getDocs(categoriesCollection);
    const categoriesList = categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)).sort((a, b) => a.name.localeCompare(b.name));
    return categoriesList;
}

export async function addCategory(userId: string, categoryData: Omit<Category, 'id'>): Promise<Category> {
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesCollection, categoryData);
    return { ...categoryData, id: docRef.id };
}

// == PASSWORD ENTRY FUNCTIONS ==

export async function getEntries(userId: string): Promise<PasswordEntry[]> {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
        console.error("Attempted to get entries with mismatched or no user ID.");
        return [];
    }
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const entrySnapshot = await getDocs(entriesCollection);
    const entryList = entrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PasswordEntry));
    return entryList;
}

export async function addEntry(userId: string, entryData: Omit<PasswordEntry, 'id'>): Promise<PasswordEntry> {
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCollection, entryData);
    return { ...entryData, id: docRef.id };
}

export async function updateEntry(userId: string, entryId: string, entryData: Partial<Omit<PasswordEntry, 'id'>>) {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await updateDoc(entryRef, entryData);
}

export async function deleteEntry(userId: string, entryId: string) {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
}
