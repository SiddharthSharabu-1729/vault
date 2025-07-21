import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { PasswordEntry } from '@/lib/data';
import { defaultCategories } from '@/lib/data';
import type { Category } from '@/lib/data';
import { encryptPassword } from './crypto';


// == CATEGORY FUNCTIONS ==

export async function createDefaultCategories(userId: string) {
    if (!userId) {
        return;
    }
    const batch = writeBatch(db);
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    
    defaultCategories.forEach(category => {
        const newCategoryRef = doc(categoriesCollection);
        batch.set(newCategoryRef, category);
    });

    await batch.commit();
}

export async function getCategories(): Promise<Category[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        return [];
    }
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const categorySnapshot = await getDocs(categoriesCollection);
    const categoriesList = categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)).sort((a, b) => a.name.localeCompare(b.name));
    return categoriesList;
}

export async function addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot add category.");
    }
    const categoriesCollection = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesCollection, categoryData);
    return { ...categoryData, id: docRef.id };
}

// == PASSWORD ENTRY FUNCTIONS ==

export async function getEntries(): Promise<PasswordEntry[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        return [];
    }
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const entrySnapshot = await getDocs(entriesCollection);
    const entryList = entrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PasswordEntry));
    // Passwords are now fetched encrypted. They will be decrypted on-demand in the UI.
    return entryList;
}

export async function addEntry(entryData: Omit<PasswordEntry, 'id'>, masterPassword: string): Promise<PasswordEntry> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot add entry.");
    }

    // Encrypt the password before storing
    const encryptedPassword = await encryptPassword(entryData.password, masterPassword);
    const dataToStore = {
        ...entryData,
        password: encryptedPassword,
    };

    const entriesCollection = collection(db, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCollection, dataToStore);
    return { ...dataToStore, id: docRef.id };
}

export async function updateEntry(entryId: string, entryData: Partial<Omit<PasswordEntry, 'id'>>, masterPassword?: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot update entry.");
    }

    const dataToUpdate = { ...entryData };

    // If a new password is being provided, encrypt it.
    if (masterPassword && entryData.password) {
        dataToUpdate.password = await encryptPassword(entryData.password, masterPassword);
    }
    
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await updateDoc(entryRef, dataToUpdate);
}

export async function deleteEntry(entryId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot delete entry.");
    }
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
}
