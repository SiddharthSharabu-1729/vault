'use client';

import {
  auth,
} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  type User
} from 'firebase/auth';
import { createDefaultCategories } from './firestore';

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    await setPersistence(auth, inMemoryPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await createDefaultCategories(userCredential.user.uid);
    }
    return userCredential;
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    await setPersistence(auth, inMemoryPersistence);
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSignOut = () => {
    return signOut(auth);
};

export const onAuthChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}
