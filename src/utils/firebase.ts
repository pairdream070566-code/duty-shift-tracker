import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDybQ6iu7KafpnYFMfcAK8qFX3NLnS4UfY",
  authDomain: "duty-tracker-8d69b.firebaseapp.com",
  projectId: "duty-tracker-8d69b",
  storageBucket: "duty-tracker-8d69b.firebasestorage.app",
  messagingSenderId: "385720757524",
  appId: "1:385720757524:web:4b0d22d2f8545da572a601",
  measurementId: "G-99HHLBQK1Z"
};

export const ALLOWED_ADMIN_EMAIL = "pairdream070566@gmail.com";

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

export const initFirebase = (customConfig?: any) => {
  const config = customConfig || DEFAULT_FIREBASE_CONFIG;
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, auth: null, db: null, googleProvider: null, isConfigured: false };
  }

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    return { app, auth, db, googleProvider, isConfigured: true };
  } catch (error) {
    console.error('Firebase init error:', error);
    return { app: null, auth: null, db: null, googleProvider: null, isConfigured: false };
  }
};

export const { isConfigured } = initFirebase();
export { auth, db, googleProvider };