
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import type { VaultEntry, ActivityLog, ProgressStep } from '@/lib/data';
import { defaultCategories } from '@/lib/data';
import type { Category } from '@/lib/data';
import { encryptPassword, decryptPassword } from './crypto';
import { doVerifyPassword } from './auth';


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
    const categoryData = categoryDoc.data();

    if (categoryData) {
        const entriesCollection = collection(db, 'users', userId, 'entries');
        const q = query(entriesCollection, where("category", "==", categoryData.slug));
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


// == VAULT RE-ENCRYPTION ==

export async function reEncryptAllEntries(oldMaster: string, newMaster: string, onProgress: (step: ProgressStep) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated.");
    }

    try {
        // Step 1: Verify old password
        onProgress('verifying');
        await doVerifyPassword(oldMaster);

        // Step 2: Fetch all entries
        onProgress('fetching');
        const allEntries = await getEntries();

        const batch = writeBatch(db);
        const entriesCollection = collection(db, 'users', userId, 'entries');

        // Step 3: Decrypt with old, re-encrypt with new
        onProgress('decrypting');
        const reEncryptedEntries = await Promise.all(allEntries.map(async (entry) => {
            const updatedEntry = { ...entry };
            if (entry.password) {
                const decrypted = await decryptPassword(entry.password, oldMaster);
                updatedEntry.password = await encryptPassword(decrypted, newMaster);
            }
            if (entry.apiKey) {
                const decrypted = await decryptPassword(entry.apiKey, oldMaster);
                updatedEntry.apiKey = await encryptPassword(decrypted, newMaster);
            }
            return updatedEntry;
        }));
        onProgress('encrypting');

        // Step 4: Batch update all documents
        reEncryptedEntries.forEach(entry => {
            const { id, ...data } = entry;
            const docRef = doc(entriesCollection, id);
            batch.set(docRef, data);
        });

        onProgress('updating');
        await batch.commit();

    } catch (error) {
        console.error("Vault re-encryption failed:", error);
        // Re-throw the error to be caught by the calling component
        throw error;
    }
}


// == ACTIVITY LOG FUNCTIONS ==

export async function addActivityLog(action: string, details: string, userIdOverride?: string) {
    const userId = userIdOverride || auth.currentUser?.uid;
    if (!userId) {
      console.warn('Cannot add activity log: user not authenticated.');
      return;
    }
  
    const logData = {
      action,
      details,
      timestamp: serverTimestamp(),
    };
  
    try {
        const activityCollection = collection(db, 'users', userId, 'activity');
        await addDoc(activityCollection, logData);
    } catch (error) {
        console.error("Failed to add activity log:", error);
    }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        return [];
    }
    const activityCollection = collection(db, 'users', userId, 'activity');
    const q = query(activityCollection, orderBy('timestamp', 'desc'));
    const logSnapshot = await getDocs(q);
    
    return logSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
}
