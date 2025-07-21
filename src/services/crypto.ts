
'use client';

// This implementation uses the Web Crypto API, available in modern browsers.
// It is crucial that this code runs only on the client-side.

// Function to derive a key from the user's master password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// We will use a static salt for simplicity. In a real-world, high-security app,
// you might use a unique salt per user stored alongside their profile.
// For this implementation, the salt is hardcoded. It's a public value used to prevent rainbow table attacks.
const SALT = new TextEncoder().encode('fortress-vault-static-salt');

// Encrypt function
export async function encryptPassword(password: string, masterPassword: string): Promise<string> {
  const key = await deriveKey(masterPassword, SALT);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
  const enc = new TextEncoder();
  
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(password)
  );

  // Combine IV and encrypted data for storage.
  // The IV is not secret and is required for decryption.
  const encryptedArray = new Uint8Array([...iv, ...new Uint8Array(encryptedData)]);
  
  // Return as a Base64 string for easy storage in Firestore.
  return btoa(String.fromCharCode.apply(null, Array.from(encryptedArray)));
}

// Decrypt function
export async function decryptPassword(encryptedPasswordB64: string, masterPassword: string): Promise<string> {
  try {
    const key = await deriveKey(masterPassword, SALT);
    
    // Decode from Base64
    const encryptedArray = new Uint8Array(atob(encryptedPasswordB64).split('').map(c => c.charCodeAt(0)));
    
    // Extract IV and the actual encrypted data
    const iv = encryptedArray.slice(0, 12);
    const data = encryptedArray.slice(12);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    // This often happens if the master password is wrong.
    throw new Error("Decryption failed. Please check your master password.");
  }
}
