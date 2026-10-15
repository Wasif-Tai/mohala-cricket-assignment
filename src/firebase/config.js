// Firebase Configuration & Initialization
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAkgesTODNz2UqlKquscjorSIzW9H_BYA4",
  authDomain: "mohala-cricket.firebaseapp.com",
  projectId: "mohala-cricket",
  storageBucket: "mohala-cricket.firebasestorage.app",
  messagingSenderId: "327803388001",
  appId: "1:327803388001:web:2f5c8f1ebc407c04d0ea20",
  measurementId: "G-39S5BJ4VGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics safely (only if supported in current browser environment)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked by adblock
  });
}

export default app;

