
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TO BE FILLED BY USER FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_API_KEY : ''),
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_AUTH_DOMAIN : ''),
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_PROJECT_ID : ''),
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_STORAGE_BUCKET : ''),
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_MESSAGING_SENDER_ID : ''),
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_APP_ID : ''),
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || (typeof process !== 'undefined' ? process.env.VITE_FIREBASE_MEASUREMENT_ID : '')
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
