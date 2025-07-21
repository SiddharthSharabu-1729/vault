'use client';

import {
  auth,
} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { createDefaultCategories } from './firestore';

// By default, Firebase uses 'local' persistence, which is what we want.
// It ensures the user stays logged in across page reloads.

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await createDefaultCategories(userCredential.user.uid);
    }
    return userCredential;
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSignOut = () => {
    return signOut(auth);
};

export const onAuthChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}