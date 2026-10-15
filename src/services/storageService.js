// Storage Service for Mohalla Cricket App
// Handles Firebase Firestore sync with seamless LocalStorage fallback

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const LOCAL_STORAGE_KEY = "mohalla_cricket_active_match";

/**
 * Save match state to Firebase Firestore and localStorage
 * @param {Object} matchData 
 * @returns {Promise<{ success: boolean, cloudSynced: boolean, error?: string }>}
 */
export async function saveMatch(matchData) {
  if (!matchData || !matchData.id) return { success: false, cloudSynced: false };

  // Always save to localStorage immediately for instant offline reliability
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(matchData));
  } catch (err) {
    console.warn("LocalStorage save error:", err);
  }

  // Attempt to save to Firebase Firestore
  try {
    const matchRef = doc(db, "matches", matchData.id);
    // Don't save history stack to cloud to keep document lightweight
    const cloudPayload = { ...matchData };
    delete cloudPayload.history;

    await setDoc(
      matchRef,
      {
        ...cloudPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, cloudSynced: true };
  } catch (error) {
    console.warn("Firebase save error (falling back to local storage):", error.message);
    return { success: true, cloudSynced: false, error: error.message };
  }
}

/**
 * Load active match from LocalStorage or Firebase
 * @returns {Object|null}
 */
export function loadActiveMatchLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to load local match:", err);
  }
  return null;
}

/**
 * Fetch match from Firestore by ID
 * @param {string} matchId 
 */
export async function fetchMatchFromCloud(matchId) {
  try {
    const matchRef = doc(db, "matches", matchId);
    const snap = await getDoc(matchRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Failed to fetch match from cloud:", err);
  }
  return null;
}

/**
 * Clear local active match cache
 */
export function clearActiveMatchLocal() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.warn("Error clearing local match cache:", err);
  }
}
