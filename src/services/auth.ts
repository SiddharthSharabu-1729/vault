
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
import { createDefaultCategories, addActivityLog as addLog } from './firestore';

// By default, Firebase uses 'local' persistence, which is what we want.
// It ensures the user stays logged in across page reloads.

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await createDefaultCategories(userCredential.user.uid);
        await addLog('User Signed Up', `New user account created for ${email}.`, userCredential.user.uid);
    }
    return userCredential;
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await addLog('User Logged In', `User ${email} logged in successfully.`, userCredential.user.uid);
    }
    return userCredential;
}

export const doSignOut = () => {
    return signOut(auth);
};

export const addActivityLog = async (action: string, details: string) => {
    const user = auth.currentUser;
    if (user) {
        await addLog(action, details, user.uid);
    }
};

export const onAuthChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}
