
'use client';

import {
  auth,
} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
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

export const doChangePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User not found or email is missing.");
    }
  
    // Create a credential with the user's email and the current password.
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
    try {
      // Re-authenticate the user to verify their identity.
      await reauthenticateWithCredential(user, credential);
  
      // If re-authentication is successful, update the password.
      await updatePassword(user, newPassword);
      
      // Log the successful password change.
      await addLog('Password Changed', 'User successfully changed their password.');
    } catch (error: any) {
      // Handle specific re-authentication errors.
      if (error.code === 'auth/wrong-password') {
        throw new Error('The current password you entered is incorrect.');
      }
      console.error("Password change error:", error);
      throw new Error('Failed to change password. Please try again.');
    }
};

export const addActivityLog = async (action: string, details: string) => {
    // This function can be called from both client and server components.
    // The Firestore SDK is not fully compatible with the Edge runtime.
    // We check if `window` is defined to ensure this only runs on the client or in a non-Edge server environment.
    if (typeof window === 'undefined') {
        return; // Do not run in Edge runtime
    }
    const user = auth.currentUser;
    if (user) {
        await addLog(action, details, user.uid);
    }
};

export const onAuthChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}
