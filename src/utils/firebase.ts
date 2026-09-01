import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN|| "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
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