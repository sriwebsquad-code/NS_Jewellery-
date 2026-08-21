// Firebase configuration for NS Jewellery
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCNIDksnHf8EeY_e9qcH8xvNheV6OIRy7Q",
  authDomain: "nsjewellery-53b2d.firebaseapp.com",
  projectId: "nsjewellery-53b2d",
  storageBucket: "nsjewellery-53b2d.firebasestorage.app",
  messagingSenderId: "815745394235",
  appId: "1:815745394235:web:adbe7045c13b4323d21e1e",
  measurementId: "G-Y6E8VZBWLX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
