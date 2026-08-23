import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC263jNeLJRMhgdyMaTsWHW2HRVIlbBEI8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "katha-9eda9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "katha-9eda9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "katha-9eda9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "83909967644",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:83909967644:web:700f558f47c964cf1004d9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-50DMPYXEMH",
};

// Initialize Firebase safely
let app;
let auth: any = null;
let googleProvider: any = null;
let db: any = null;
export let isOfflineMode = false;

try {
  // Only initialize if we have a real looking API key, otherwise skip to prevent crashes
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy-api-key") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } else {
    console.warn("Firebase config missing - running in local-only mode");
    isOfflineMode = true;
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  isOfflineMode = true;
}

export { auth, googleProvider, db };

export default app;
