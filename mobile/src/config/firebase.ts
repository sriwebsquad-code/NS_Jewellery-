// TODO: Add your Firebase project configuration here
// 1. Go to console.firebase.google.com
// 2. Create a project and enable Phone Authentication
// 3. Add a web app (or React Native app) and copy the config here

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3Gu0czVeuinqYmMvzlAioSHYm5BWt06Y",
  authDomain: "rnmahaveerjewellery.firebaseapp.com",
  projectId: "rnmahaveerjewellery",
  storageBucket: "rnmahaveerjewellery.firebasestorage.app",
  messagingSenderId: "908931576195",
  appId: "1:908931576195:android:734840213529222e3206b6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
