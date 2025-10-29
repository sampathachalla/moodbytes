import {
    doc,
    getDoc,
    setDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { getCurrentUser } from './auth';
import { db } from './firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  totalSearches: number;
  favoriteMoods: string[];
  searchHistory: string[]; // Array of search history document IDs
}

// Create or update user data in Firestore
export const saveUserToFirestore = async (user: any): Promise<boolean> => {
  try {
    console.log('Saving user to Firestore:', user.uid, user.email);
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData: Partial<UserData> = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastLoginAt: Timestamp.now(),
    };

    if (userDoc.exists()) {
      // User exists, update last login
      console.log('User exists, updating last login');
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now(),
        displayName: user.displayName || userDoc.data().displayName,
        photoURL: user.photoURL || userDoc.data().photoURL,
      });
    } else {
      // New user, create document
      console.log('New user, creating document');
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        totalSearches: 0,
        favoriteMoods: [],
        searchHistory: [],
      });
    }
    
    console.log('User data saved successfully to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    return false;
  }
};

// Get user data from Firestore
export const getUserFromFirestore = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      console.log('Retrieved user data from Firestore:', userData.uid);
      return userData;
    } else {
      console.log('User document not found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

// Update user's search count (increment)
export const updateUserSearchCount = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot update search count');
      return false;
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data() as UserData;
      await updateDoc(userRef, {
        totalSearches: (currentData.totalSearches || 0) + 1,
      });
      console.log('Updated user search count');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating user search count:', error);
    return false;
  }
};

// Decrease user's search count (decrement)
export const decreaseUserSearchCount = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot update search count');
      return false;
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data() as UserData;
      const newCount = Math.max(0, (currentData.totalSearches || 0) - 1);
      await updateDoc(userRef, {
        totalSearches: newCount,
      });
      console.log('Decreased user search count to:', newCount);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error decreasing user search count:', error);
    return false;
  }
};

// Note: addSearchToUserHistory function removed since we now use sub-collections
// Search history is automatically mapped to users via the sub-collection structure
