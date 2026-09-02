import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';

// Initialize Firebase Admin with default app if not already initialized
if (getApps().length === 0) {
  let serviceAccount;
  
  // 1. Try to load from Environment Variable first (Render/Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT from environment");
    }
  } 
  
  // 2. Fallback to local file for development
  if (!serviceAccount) {
    serviceAccount = require('../../firebase-service-account.json');
  }
  
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'nsmj2023-6b271.firebasestorage.app'
  });
}

const app = getApp();
export const db = getFirestore(app);
export const storage = getStorage(app).bucket();
export default app;
