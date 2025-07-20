'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import type { PasswordEntry } from '@/lib/data';
import { defaultCategories } from '@/lib/data';
import type { Category } from '@/lib/data';
import { getAuth } from 'firebase/auth';

// This function is now more of a guard and doesn't throw an error if auth is initializing.
// It returns true if the user is authenticated and matches, otherwise false.
function isUserAuthenticated(userId: string): boolean {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
        // Log the reason but don't throw an error that crashes the app.
        // The security rules will handle the denial.
        console.warn("Firestore access attempt failed: user not authenticated or mismatch.");
        return false;
    }
    return true;
}

// == CATEGORY FUNCTIONS ==

export async function createDefaultCategories(userId: string) {
    if (!isUserAuthenticated(userId)) return;
    const batch = writeBatch(db);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    
    defaultCategories.forEach(category => {
        const newCategoryRef = doc(categoriesCollection);
        batch.set(newCategoryRef, category);
    });

    await batch.commit();
}

export async function getCategories(userId: string): Promise<Category[]> {
    if (!isUserAuthenticated(userId)) return [];
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const categorySnapshot = await getDocs(categoriesCollection);
    const categoriesList = categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)).sort((a, b) => a.name.localeCompare(b.name));
    return categoriesList;
}

export async function addCategory(userId: string, categoryData: Omit<Category, 'id'>): Promise<Category> {
    if (!isUserAuthenticated(userId)) throw new Error("Permission denied.");
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesCollection, categoryData);
    return { ...categoryData, id: docRef.id };
}

// == PASSWORD ENTRY FUNCTIONS ==

export async function getEntries(userId: string): Promise<PasswordEntry[]> {
    if (!isUserAuthenticated(userId)) return [];
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const entrySnapshot = await getDocs(entriesCollection);
    const entryList = entrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PasswordEntry));
    return entryList;
}

export async function addEntry(userId: string, entryData: Omit<PasswordEntry, 'id'>): Promise<PasswordEntry> {
    if (!isUserAuthenticated(userId)) throw new Error("Permission denied.");
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCollection, entryData);
    return { ...entryData, id: docRef.id };
}

export async function updateEntry(userId: string, entryId: string, entryData: Partial<Omit<PasswordEntry, 'id'>>) {
    if (!isUserAuthenticated(userId)) throw new Error("Permission denied.");
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await updateDoc(entryRef, entryData);
}

export async function deleteEntry(userId: string, entryId: string) {
    if (!isUserAuthenticated(userId)) throw new Error("Permission denied.");
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
}
