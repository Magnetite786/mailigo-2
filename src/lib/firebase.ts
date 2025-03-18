import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { useEffect, useState } from "react";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBR1eT2376UoRmovCpQJdSjiynROD_VWk",
  authDomain: "bulkmail-eb5d5.firebaseapp.com",
  projectId: "bulkmail-eb5d5",
  storageBucket: "bulkmail-eb5d5.firebasestorage.app",
  messagingSenderId: "943414592862",
  appId: "1:943414592862:web:8851d6d6dda135443efbcf"
};

// Initialize Firebase with enhanced cache settings
const app = initializeApp(firebaseConfig);

// Initialize auth with persistent local storage
export const auth = getAuth(app);

// Set auth persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Use initializeFirestore with persistence settings instead of getFirestore
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Store the user ID globally to help with debugging
let currentUserId = null;

// Auth functions
export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

// Custom hook for auth state
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
        setUser(user);
        setLoading(false);
        setError(null);
        
        // Update global user ID
        currentUserId = user?.uid || null;
        
        // Store user info in localStorage for debugging persistence issues
        if (user) {
          try {
            localStorage.setItem('userAuth', JSON.stringify({
              uid: user.uid,
              email: user.email,
              timestamp: new Date().toISOString()
            }));
            console.log("User auth data cached to localStorage");
          } catch (e) {
            console.warn("Could not store auth data in localStorage:", e);
          }
        }
      },
      (error) => {
        console.error("Auth state error:", error);
        setError(error.message);
      }
    );

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
};

// Function to get current user ID that doesn't depend on hook
export const getCurrentUserId = () => {
  return currentUserId || auth.currentUser?.uid || null;
};
