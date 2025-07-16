'use server';

import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import type { PasswordEntry } from '@/lib/data';
import { defaultCategories } from '@/lib/data';
import type { Category } from '@/lib/data';

function ensureAuthenticated(userId: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("Permission denied: User is not authenticated.");
    }
    if (currentUser.uid !== userId) {
        throw new Error("Permission denied: User ID does not match authenticated user.");
    }
    return currentUser;
}

// == CATEGORY FUNCTIONS ==

export async function createDefaultCategories(userId: string) {
    ensureAuthenticated(userId);
    const batch = writeBatch(db);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    
    defaultCategories.forEach(category => {
        const newCategoryRef = doc(categoriesCollection);
        batch.set(newCategoryRef, category);
    });

    await batch.commit();
}

export async function getCategories(userId: string): Promise<Category[]> {
    ensureAuthenticated(userId);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const categorySnapshot = await getDocs(categoriesCollection);
    const categoriesList = categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)).sort((a, b) => a.name.localeCompare(b.name));
    return categoriesList;
}

export async function addCategory(userId: string, categoryData: Omit<Category, 'id'>): Promise<Category> {
    ensureAuthenticated(userId);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesCollection, categoryData);
    return { ...categoryData, id: docRef.id };
}

// == PASSWORD ENTRY FUNCTIONS ==

export async function getEntries(userId: string): Promise<PasswordEntry[]> {
    ensureAuthenticated(userId);
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const entrySnapshot = await getDocs(entriesCollection);
    const entryList = entrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PasswordEntry));
    return entryList;
}

export async function addEntry(userId: string, entryData: Omit<PasswordEntry, 'id'>): Promise<PasswordEntry> {
    ensureAuthenticated(userId);
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCollection, entryData);
    return { ...entryData, id: docRef.id };
}

export async function updateEntry(userId: string, entryId: string, entryData: Partial<Omit<PasswordEntry, 'id'>>) {
    ensureAuthenticated(userId);
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await updateDoc(entryRef, entryData);
}

export async function deleteEntry(userId: string, entryId: string) {
    ensureAuthenticated(userId);
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
}