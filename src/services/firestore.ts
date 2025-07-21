import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where, getDoc } from 'firebase/firestore';
import type { VaultEntry } from '@/lib/data';
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

export async function deleteCategory(categoryId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot delete category.");
    }

    const batch = writeBatch(db);

    // 1. Find all entries in the category to be deleted
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    const categoryDoc = await getDoc(categoryRef);
    const categorySlug = categoryDoc.data()?.slug;

    if (categorySlug) {
        const entriesCollection = collection(db, 'users', userId, 'entries');
        const q = query(entriesCollection, where("category", "==", categorySlug));
        const entriesToDeleteSnapshot = await getDocs(q);
        
        // 2. Add delete operations for each entry to the batch
        entriesToDeleteSnapshot.forEach(entryDoc => {
            batch.delete(doc(db, 'users', userId, 'entries', entryDoc.id));
        });
    }

    // 3. Add the delete operation for the category itself
    batch.delete(categoryRef);

    // 4. Commit the batch
    await batch.commit();
}


// == VAULT ENTRY FUNCTIONS ==

export async function getEntries(): Promise<VaultEntry[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        return [];
    }
    const entriesCollection = collection(db, 'users', userId, 'entries');
    const entrySnapshot = await getDocs(entriesCollection);
    const entryList = entrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as VaultEntry));
    // Passwords are now fetched encrypted. They will be decrypted on-demand in the UI.
    return entryList;
}

export async function addEntry(entryData: Omit<VaultEntry, 'id'>, masterPassword: string): Promise<VaultEntry> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot add entry.");
    }

    const dataToStore: Omit<VaultEntry, 'id'> = { ...entryData };

    // Encrypt the password if it exists
    if (dataToStore.password) {
        dataToStore.password = await encryptPassword(dataToStore.password, masterPassword);
    }
    
    // Encrypt the API key if it exists
    if (dataToStore.apiKey) {
        dataToStore.apiKey = await encryptPassword(dataToStore.apiKey, masterPassword);
    }

    const entriesCollection = collection(db, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCollection, dataToStore);
    return { ...dataToStore, id: docRef.id };
}

export async function updateEntry(entryId: string, entryData: Partial<Omit<VaultEntry, 'id'>>, masterPassword?: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User is not authenticated. Cannot update entry.");
    }

    const dataToUpdate = { ...entryData };

    // If a master password is provided, re-encrypt sensitive fields
    if (masterPassword) {
        if (entryData.password) {
            dataToUpdate.password = await encryptPassword(entryData.password, masterPassword);
        }
        if (entryData.apiKey) {
            dataToUpdate.apiKey = await encryptPassword(entryData.apiKey, masterPassword);
        }
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
