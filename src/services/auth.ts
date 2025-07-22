
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
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { createDefaultCategories, addActivityLog as addLog } from './firestore';

// By default, Firebase uses 'local' persistence, which is what we want.
// It ensures the user stays logged in across page reloads.

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        // Send a verification email to the user.
        await sendEmailVerification(userCredential.user);
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

export const doPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
};

export const doChangePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found.");
    }
  
    // The user should have been recently re-authenticated by `doVerifyPassword`
    // before this function is called. We can proceed directly to updatePassword.
    try {
      await updatePassword(user, newPassword);
      
      // NOTE: Firebase automatically sends a secure "Password Changed" notification
      // email to the user. No additional code is needed for this step.
      
      // Log the successful password change.
      await addLog('Password Changed', 'User successfully changed their password.');
    } catch (error: any) {
        // This error can still happen if re-authentication was too long ago.
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('For security, please verify your current password again to complete this change.');
      }
      console.error("Password change error:", error);
      throw new Error('Failed to change password. Please try again.');
    }
};

export const doVerifyPassword = async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User not found or email is missing.");
    }
  
    const credential = EmailAuthProvider.credential(user.email, password);
  
    try {
      await reauthenticateWithCredential(user, credential);
      // If it doesn't throw, the password is correct.
      return true;
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('The master password you entered is incorrect.');
      }
      console.error("Password verification error:", error);
      throw new Error('Could not verify master password. Please try again.');
    }
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

export const getFriendlyAuthErrorMessage = (error: any): string => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
};
