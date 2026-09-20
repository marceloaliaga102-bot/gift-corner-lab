// Firebase Configuration and Initialization Service
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfigData {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = 'gift_corner_firebase_config';

// 1. Check environment variables first (e.g. for Vercel deployment)
const getEnvConfig = (): FirebaseConfigData | null => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (apiKey && projectId && appId) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
  }
  return null;
};

import { SHARED_FIREBASE_CREDENTIALS } from './firebaseCredentials';

// 2. Read from localStorage (allows Admin to configure directly from UI without rebuilds)
export const getStoredFirebaseConfig = (): FirebaseConfigData | null => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId && parsed.appId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e);
  }

  // Check env config
  const envConfig = getEnvConfig();
  if (envConfig) return envConfig;

  // Check shared credentials
  if (SHARED_FIREBASE_CREDENTIALS.apiKey && SHARED_FIREBASE_CREDENTIALS.projectId && SHARED_FIREBASE_CREDENTIALS.appId) {
    return SHARED_FIREBASE_CREDENTIALS;
  }

  return null;
};

export const saveStoredFirebaseConfig = (config: FirebaseConfigData | null): void => {
  try {
    if (config) {
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving Firebase config to localStorage:', e);
  }
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const isFirebaseConfigured = (): boolean => {
  const config = getStoredFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId && config.appId);
};

export const initFirebase = (customConfig?: FirebaseConfigData): { app: FirebaseApp; db: Firestore } | null => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId || !config.appId) {
    return null;
  }

  try {
    const existingApps = getApps();
    let app: FirebaseApp;
    if (existingApps.length > 0) {
      app = getApp();
    } else {
      app = initializeApp(config);
    }
    const db = getFirestore(app);
    cachedApp = app;
    cachedDb = db;
    return { app, db };
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return null;
  }
};

export const getFirestoreInstance = (): Firestore | null => {
  if (cachedDb) return cachedDb;
  const init = initFirebase();
  return init ? init.db : null;
};
