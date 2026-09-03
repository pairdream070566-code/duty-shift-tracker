import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDybQ6iu7KafpnYFMfcAK8qFX3NLnS4UfY",
  authDomain: "duty-tracker-8d69b.firebaseapp.com",
  projectId: "duty-tracker-8d69b",
  storageBucket: "duty-tracker-8d69b.firebasestorage.app",
  messagingSenderId: "385720757524",
  appId: "1:385720757524:web:4b0d22d2f8545da572a601",
  measurementId: "G-99HHLBQK1Z"
};

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);