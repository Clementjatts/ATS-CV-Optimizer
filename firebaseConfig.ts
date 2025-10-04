// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPwSLZV8HQ9fDCOv_Xi97vsBuDYgM16-M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ats-cv-optimizer-3a741.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ats-cv-optimizer-3a741",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ats-cv-optimizer-3a741.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "621330035833",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:621330035833:web:2272ebeb6e25de9dd110a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
