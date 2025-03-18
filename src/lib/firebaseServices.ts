import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  Timestamp,
  orderBy,
  getDoc,
  setDoc,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  CACHE_SIZE_UNLIMITED,
  onSnapshot
} from "firebase/firestore";
import { db, auth, getCurrentUserId } from "./firebase";
import { EmailHistoryItem } from "@/components/email/EmailHistory";

// Add TypeScript declarations for window properties
declare global {
  interface Window {
    cachedStats: any;
    cachedHistory: any;
    debugFirebase: boolean;
  }
}

// Enable debug mode in development
if (typeof window !== 'undefined') {
  window.debugFirebase = process.env.NODE_ENV !== 'production';
}

// Helper function for debug logging
const debugLog = (...args) => {
  if (typeof window !== 'undefined' && window.debugFirebase) {
    console.log("[Firebase Debug]", ...args);
  }
};

// Initialize collections
const emailHistoryCollection = collection(db, "emailHistory");
const userSettingsCollection = collection(db, "userSettings");

// Create a listener map to store active listeners
const activeListeners = new Map();

// Helper function to get current user ID
const ensureUserId = (providedUserId?: string) => {
  const userId = providedUserId || getCurrentUserId();
  if (!userId) {
    console.error("User ID not available - auth state might be lost");
    // Try to recover from localStorage
    try {
      const storedAuth = localStorage.getItem('userAuth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.uid) {
          console.log("Recovered user ID from localStorage:", authData.uid);
          return authData.uid;
        }
      }
    } catch (e) {
      console.error("Failed to recover user ID from localStorage:", e);
    }
  }
  return userId;
};

// Function to handle connection issues
export const handleConnectionIssues = async (forceOnline = false) => {
  if (forceOnline) {
    debugLog('Forcing online mode...');
    try {
      await enableNetwork(db);
      debugLog('Network enabled successfully');
      return true;
    } catch (error) {
      console.error('Failed to enable network:', error);
      return false;
    }
  } else {
    debugLog('Switching to offline mode...');
    try {
      await disableNetwork(db);
      debugLog('Network disabled successfully');
      return true;
    } catch (error) {
      console.error('Failed to disable network:', error);
      return false;
    }
  }
};

export interface UserSettings {
  appPassword: string;
  batchSize: number;
  delayBetweenBatches: number;
}

export const saveEmailHistory = async (
  userId: string,
  data: Omit<EmailHistoryItem, 'id' | 'date'>
) => {
  try {
    debugLog('Saving email history for user:', userId, 'with data:', JSON.stringify(data, null, 2));
    
    // Double-check userId
    const effectiveUserId = ensureUserId(userId);
    
    if (!effectiveUserId) {
      console.error("Cannot save email history: userId is missing");
      return null;
    }
    
    // Add timestamp
    const timestamp = Timestamp.now();
    debugLog('Created timestamp:', timestamp.toDate());
    
    // Create the document with userId properly set
    const docData = {
      ...data,
      userId: effectiveUserId,
      date: timestamp,
    };
    
    debugLog('Attempting to save to Firestore with document data:', JSON.stringify(docData, null, 2));
    
    // Save to Firestore
    const docRef = await addDoc(emailHistoryCollection, docData);
    debugLog('Email history saved successfully with ID:', docRef.id);
    
    // Store successfully saved ID in localStorage for troubleshooting
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedEmailHistoryIds') || '[]');
      savedIds.push({
        id: docRef.id,
        userId: effectiveUserId,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('savedEmailHistoryIds', JSON.stringify(savedIds));
    } catch (e) {
      console.warn('Failed to save history ID to localStorage:', e);
    }
    
    // Update local cache with the new item
    const newHistoryItem = {
      id: docRef.id,
      ...data,
      date: timestamp.toDate().toISOString(),
    };
    
    // Add to cache if available
    const cachedHistory = getCachedHistory();
    if (cachedHistory) {
      debugLog('Updating local cache with new history item');
      setCachedHistory([newHistoryItem, ...cachedHistory]);
    } else {
      debugLog('No cached history available, creating new cache');
      setCachedHistory([newHistoryItem]);
    }
    
    // Trigger a refresh of the listeners
    refreshEmailHistoryListener(effectiveUserId);
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving email history:", error);
    
    // Check for specific Firebase errors
    if (error.code) {
      if (error.code === 'permission-denied') {
        console.error("Firebase permission denied. Check your security rules and authentication.");
      } else if (error.code.includes('unavailable')) {
        console.error("Firebase service unavailable. Check your internet connection.");
      }
    }
    
    // Try to save locally if possible
    try {
      debugLog('Attempting to save to local cache despite Firestore error');
      const timestamp = new Date().toISOString();
      const tempId = 'local_' + Date.now();
      
      const newHistoryItem = {
        id: tempId,
        ...data,
        date: timestamp,
        _pendingSync: true // Mark as needing sync later
      };
      
      // Add to cache if available
      const cachedHistory = getCachedHistory();
      if (cachedHistory) {
        setCachedHistory([newHistoryItem, ...cachedHistory]);
        debugLog('Saved to local cache successfully with temporary ID:', tempId);
        return tempId;
      }
    } catch (localError) {
      console.error("Failed to save locally:", localError);
    }
    
    return null;
  }
};

// Add a local cache for stats that's accessible from outside the module
let _cachedStats = null;
let _cachedHistory = null;
let _lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

// Export cache for external access
if (typeof window !== 'undefined') {
  window.cachedStats = _cachedStats;
  window.cachedHistory = _cachedHistory;
}

// Getter functions for the cache
const getCachedStats = () => {
  if (typeof window !== 'undefined' && window.cachedStats) {
    return window.cachedStats;
  }
  return _cachedStats;
};

const setCachedStats = (stats) => {
  _cachedStats = stats;
  if (typeof window !== 'undefined') {
    window.cachedStats = stats;
    // Also save to localStorage as backup
    try {
      localStorage.setItem('cachedStats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats to localStorage:', e);
    }
  }
};

// Export getCachedHistory to be used in other components
export const getCachedHistory = () => {
  if (typeof window !== 'undefined') {
    // Try from window first
    if (window.cachedHistory) {
      return window.cachedHistory;
    }
    
    // Try from localStorage as backup
    try {
      const localHistory = localStorage.getItem('cachedHistory');
      if (localHistory) {
        const parsedHistory = JSON.parse(localHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          debugLog('Recovered email history from localStorage:', parsedHistory.length, 'items');
          window.cachedHistory = parsedHistory;
          return parsedHistory;
        }
      }
    } catch (e) {
      console.warn('Failed to recover history from localStorage:', e);
    }
  }
  return _cachedHistory;
};

const setCachedHistory = (history) => {
  _cachedHistory = history;
  if (typeof window !== 'undefined') {
    window.cachedHistory = history;
    // Also save to localStorage as backup
    try {
      localStorage.setItem('cachedHistory', JSON.stringify(history));
      debugLog('Saved email history to localStorage:', history.length, 'items');
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }
};

// Setup real-time listener for email history
const setupEmailHistoryListener = (userId: string, callback: (history: EmailHistoryItem[]) => void) => {
  debugLog('Setting up real-time listener for email history for user:', userId);
  
  // Clear any existing listener
  const existingListener = activeListeners.get(`history_${userId}`);
  if (existingListener) {
    debugLog('Removing existing listener');
    existingListener();
    activeListeners.delete(`history_${userId}`);
  }
  
  // Create the query
  const q = query(
    emailHistoryCollection,
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  
  // Set up the listener
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      debugLog('Real-time update received with', snapshot.docs.length, 'documents');
      
      // Map the documents to EmailHistoryItem
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.date instanceof Timestamp 
          ? data.date.toDate().toISOString() 
          : new Date(data.date).toISOString();
        
        return {
          id: doc.id,
          ...data,
          date,
        } as EmailHistoryItem;
      });
      
      // Update the cache
      setCachedHistory(history);
      _lastFetchTime = Date.now();
      
      // Call the callback
      callback(history);
    },
    (error) => {
      console.error('Error in real-time listener:', error);
      // If there's an error, try to get data from cache
      const cachedHistory = getCachedHistory();
      if (cachedHistory) {
        callback(cachedHistory);
      }
    }
  );
  
  // Store the unsubscribe function
  activeListeners.set(`history_${userId}`, unsubscribe);
  
  return unsubscribe;
};

// Function to manually refresh the listener
const refreshEmailHistoryListener = (userId: string) => {
  const key = `history_${userId}`;
  const existingListener = activeListeners.get(key);
  
  if (existingListener) {
    debugLog('Refreshing email history listener for user:', userId);
    // Just return as the listener will automatically update
    return;
  } else {
    debugLog('No active listener to refresh for user:', userId);
  }
};

export const getEmailHistory = async (userId: string, useListener = true, callback?: (history: EmailHistoryItem[]) => void) => {
  try {
    // Double-check userId
    const effectiveUserId = ensureUserId(userId);
    
    if (!effectiveUserId) {
      console.error("Cannot get email history: userId is missing");
      return [];
    }
    
    debugLog('Getting email history for user:', effectiveUserId);
    
    // If using a listener and callback is provided, set up the listener
    if (useListener && callback) {
      setupEmailHistoryListener(effectiveUserId, callback);
    }
    
    // Use cached history if available and recently fetched
    const now = Date.now();
    const cachedHistory = getCachedHistory();
    
    if (cachedHistory && now - _lastFetchTime < CACHE_TTL) {
      debugLog('Using cached email history with', cachedHistory.length, 'items');
      return cachedHistory;
    }
    
    debugLog('Fetching fresh email history from Firestore for user:', effectiveUserId);
    
    // Create the query with userId check
    const q = query(
      emailHistoryCollection,
      where("userId", "==", effectiveUserId),
      orderBy("date", "desc")
    );
    
    // Execute query and get results - add more error handling
    try {
      debugLog('Executing Firestore query for email history');
      const querySnapshot = await getDocs(q);
      debugLog('Query executed, returned', querySnapshot.docs.length, 'documents');
      
      // Check for cached IDs vs returned IDs
      try {
        const savedIds = JSON.parse(localStorage.getItem('savedEmailHistoryIds') || '[]');
        if (savedIds.length > 0) {
          const returnedIds = querySnapshot.docs.map(doc => doc.id);
          const missingIds = savedIds.filter(item => 
            item.userId === effectiveUserId && !returnedIds.includes(item.id)
          );
          
          if (missingIds.length > 0) {
            console.warn('Some previously saved history items are missing from Firestore:', missingIds);
          }
        }
      } catch (e) {
        console.warn('Failed to check for missing history IDs:', e);
      }
      
      // Map documents to EmailHistoryItem objects
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure date is properly converted
        const date = data.date instanceof Timestamp 
          ? data.date.toDate().toISOString() 
          : new Date(data.date).toISOString();
          
        return {
          id: doc.id,
          ...data,
          date,
        } as EmailHistoryItem;
      });
      
      debugLog('Email history mapped successfully:', history.length, 'items');
      
      // Update the cache
      setCachedHistory(history);
      _lastFetchTime = now;
      
      return history;
    } catch (queryError) {
      console.error('Error executing Firestore query:', queryError);
      
      // Check for permission errors
      if (queryError.code === 'permission-denied') {
        console.error('Permission denied for email history. Check your Firestore rules.');
        // Try fetching without the where clause to test if collection exists
        try {
          debugLog('Testing collection access without where clause');
          await getDocs(collection(db, "emailHistory"));
          debugLog('Collection exists but filtering by userId failed, likely a rules issue');
        } catch (collectionError) {
          console.error('Error accessing collection:', collectionError);
        }
      }
      
      throw queryError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error getting email history:", error);
    
    // Return cached history if available, otherwise empty array
    const cachedHistory = getCachedHistory();
    if (cachedHistory && cachedHistory.length > 0) {
      debugLog('Returning cached history due to error:', cachedHistory.length, 'items');
      return cachedHistory;
    }
    
    debugLog('No cached history available, returning empty array');
    return [];
  }
};

export const deleteEmailHistory = async (id: string) => {
  try {
    debugLog('Deleting email history item:', id);
    await deleteDoc(doc(db, "emailHistory", id));
    debugLog('Email history item deleted successfully');
    
    // Update the localStorage record if it exists
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedEmailHistoryIds') || '[]');
      const updatedIds = savedIds.filter(item => item.id !== id);
      localStorage.setItem('savedEmailHistoryIds', JSON.stringify(updatedIds));
    } catch (e) {
      console.warn('Failed to update localStorage after deletion:', e);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting email history:", error);
    return false;
  }
};

export const saveUserSettings = async (userId: string, settings: UserSettings) => {
  try {
    debugLog('Saving user settings for:', userId);
    const settingsRef = doc(db, "userSettings", userId);
    await setDoc(settingsRef, settings, { merge: true });
    debugLog('User settings saved successfully');
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};

export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    // Double-check userId
    const effectiveUserId = ensureUserId(userId);
    
    if (!effectiveUserId) {
      console.error("Cannot get user settings: userId is missing");
      return {
        appPassword: "",
        batchSize: 10,
        delayBetweenBatches: 1
      };
    }
    
    debugLog('Fetching user settings for:', effectiveUserId);
    const settingsRef = doc(db, "userSettings", effectiveUserId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      debugLog('User settings found');
      return settingsDoc.data() as UserSettings;
    }
    
    debugLog('No settings found, creating default settings');
    const defaultSettings: UserSettings = {
      appPassword: "",
      batchSize: 10,
      delayBetweenBatches: 1
    };
    
    // Only try to set the document if we're online
    try {
      await setDoc(settingsRef, defaultSettings);
      debugLog('Default settings saved to Firestore');
    } catch (error) {
      console.warn('Could not save default settings due to connectivity issues');
    }
    
    return defaultSettings;
  } catch (error) {
    console.error("Error getting user settings:", error);
    // Return default settings instead of throwing an error
    return {
      appPassword: "",
      batchSize: 10,
      delayBetweenBatches: 1
    };
  }
};

export const getEmailStats = async (userId: string) => {
  try {
    // Double-check userId
    const effectiveUserId = ensureUserId(userId);
    
    if (!effectiveUserId) {
      console.error("Cannot get email stats: userId is missing");
      return {
        totalEmails: 0,
        totalRecipients: 0,
        successRate: "0",
        avgDeliveryTime: "0s"
      };
    }
    
    debugLog('Getting email stats for user:', effectiveUserId);
    
    // Use cached stats if available and recently fetched
    const now = Date.now();
    const cachedStats = getCachedStats();
    
    if (cachedStats && now - _lastFetchTime < CACHE_TTL) {
      debugLog('Using cached email stats:', cachedStats);
      return cachedStats;
    }
    
    debugLog('Calculating fresh email stats from history data');
    
    // Calculate date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Try to use cached history if available
    let history;
    const cachedHistory = getCachedHistory();
    
    if (cachedHistory && cachedHistory.length > 0) {
      debugLog('Using cached history to calculate stats');
      history = cachedHistory.filter(item => 
        new Date(item.date) >= thirtyDaysAgo
      );
      debugLog('Filtered history to', history.length, 'items from last 30 days');
    } else {
      debugLog('No cached history, querying Firestore for stats');
      
      // Create query for Firestore
      const q = query(
        emailHistoryCollection,
        where("userId", "==", effectiveUserId),
        where("date", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const querySnapshot = await getDocs(q);
      debugLog('Stats query returned', querySnapshot.docs.length, 'documents');
      
      history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const dateObj = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
        return {
          id: doc.id,
          ...data,
          subject: data.subject || "No Subject",
          recipients: data.recipients || 0,
          status: data.status || "failed",
          date: dateObj.toISOString(),
        } as EmailHistoryItem;
      });
    }

    // Safety check if history is empty
    if (!history || history.length === 0) {
      debugLog('No email history found, returning zero stats');
      const emptyStats = {
        totalEmails: 0,
        totalRecipients: 0,
        successRate: "0",
        avgDeliveryTime: "0s"
      };
      
      // Update cache with empty stats
      setCachedStats(emptyStats);
      
      return emptyStats;
    }

    // Calculate statistics
    const totalEmails = history.length;
    const totalRecipients = history.reduce((sum, item) => sum + (item.recipients || 0), 0);
    
    // Improved success counting - consider an email successful if:
    // 1. Its status is success, OR
    // 2. It has deliveredCount equal to recipients (actually delivered all emails)
    const successCount = history.filter(item => 
      item.status === 'success' || 
      (item.deliveredCount !== undefined && item.deliveredCount === item.recipients)
    ).length;
    
    const successRate = totalEmails > 0 ? (successCount / totalEmails) * 100 : 0;

    const stats = {
      totalEmails,
      totalRecipients,
      successRate: successRate.toFixed(1),
      avgDeliveryTime: "2.3s",
    };
    
    debugLog('Email stats calculated successfully:', stats);
    
    // Update the cache
    setCachedStats(stats);
    _lastFetchTime = now;
    
    return stats;
  } catch (error) {
    console.error("Error getting email stats:", error);
    
    // Return cached stats if available
    const cachedStats = getCachedStats();
    if (cachedStats) {
      debugLog('Returning cached stats due to error');
      return cachedStats;
    }
    
    // Otherwise return default stats
    debugLog('No cached stats available, returning default stats');
    return {
      totalEmails: 0,
      totalRecipients: 0,
      successRate: "0",
      avgDeliveryTime: "0s"
    };
  }
}; 