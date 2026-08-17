import { initializeApp, getApps, getApp } from 'firebase-admin/app';

// Initialize Firebase Admin with default app if not already initialized
if (getApps().length === 0) {
  initializeApp({
    // In production, configure credential from environment variable
  });
}

const app = getApp();
export default app;
