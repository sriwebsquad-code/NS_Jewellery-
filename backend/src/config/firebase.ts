import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';

// Initialize Firebase Admin with default app if not already initialized
if (getApps().length === 0) {
  const serviceAccount = require('../../firebase-service-account.json');
  
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'rnmahaveerjewellery.firebasestorage.app'
  });
}

const app = getApp();
export const db = getFirestore(app);
export const storage = getStorage(app).bucket();
export default app;
