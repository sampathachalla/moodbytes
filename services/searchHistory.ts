import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import { getCurrentUser } from './auth';
import { db } from './firebase';
import { updateUserSearchCount } from './userService';

export interface SearchHistoryItem {
  id?: string;
  userId: string;
  mood: string;
  location: {
    latitude: number;
    longitude: number;
  };
  searchResults: {
    places: any[];
    totalCount: number;
  };
  timestamp: Date;
  createdAt: Timestamp;
}

// Save search to history in user's sub-collection
export const saveSearchToHistory = async (
  mood: string,
  latitude: number,
  longitude: number,
  searchResults: any
): Promise<string | null> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot save search history');
      return null;
    }

    console.log('Saving search history for user:', user.uid);
    console.log('User email:', user.email);

    // Handle different API response structures
    let placesArray = [];
    let totalCount = 0;
    
    if (Array.isArray(searchResults)) {
      // If searchResults is directly an array
      placesArray = searchResults;
      totalCount = searchResults.length;
    } else if (searchResults.places && Array.isArray(searchResults.places)) {
      // If searchResults has a places property
      placesArray = searchResults.places;
      totalCount = searchResults.places.length;
    } else if (searchResults.results && Array.isArray(searchResults.results)) {
      // If searchResults has a results property
      placesArray = searchResults.results;
      totalCount = searchResults.results.length;
    } else {
      // Fallback - treat the entire searchResults as places if it's an object
      placesArray = [searchResults];
      totalCount = 1;
    }

    const searchHistoryData = {
      mood,
      location: {
        latitude,
        longitude,
      },
      searchResults: {
        places: placesArray,
        totalCount: totalCount,
      },
      timestamp: new Date(),
      createdAt: Timestamp.now(),
    };

    console.log('Search history data to save:', {
      mood: searchHistoryData.mood,
      totalCount: searchHistoryData.searchResults.totalCount,
      placesCount: searchHistoryData.searchResults.places.length,
      searchResults: searchHistoryData.searchResults
    });

    // Save to user's sub-collection: users/{userId}/searchHistory/{searchId}
    const userSearchHistoryRef = collection(db, 'users', user.uid, 'searchHistory');
    const docRef = await addDoc(userSearchHistoryRef, searchHistoryData);
    console.log('Search saved to user sub-collection with ID:', docRef.id, 'for user:', user.uid);
    
    // Update user's search count
    try {
      await updateUserSearchCount();
      console.log('Updated user search count');
    } catch (userUpdateError) {
      console.error('Error updating user data:', userUpdateError);
    }
    
    // Verify the data was saved correctly by reading it back
    console.log('Verifying saved data...');
    try {
      const savedDoc = await getDocs(query(userSearchHistoryRef, where('mood', '==', mood)));
      savedDoc.forEach((doc) => {
        console.log('Found document for user:', doc.id, 'mood:', doc.data().mood);
      });
    } catch (verifyError) {
      console.log('Could not verify saved data:', verifyError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving search to history:', error);
    return null;
  }
};

// Get user's search history from sub-collection
export const getUserSearchHistory = async (limitCount: number = 20): Promise<SearchHistoryItem[]> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot fetch search history');
      return [];
    }

    console.log('Fetching search history for user:', user.uid);
    console.log('User email:', user.email);

    // Query user's sub-collection: users/{userId}/searchHistory
    const userSearchHistoryRef = collection(db, 'users', user.uid, 'searchHistory');
    const q = query(
      userSearchHistoryRef,
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const searchHistory: SearchHistoryItem[] = [];

    console.log('Query snapshot size:', querySnapshot.size);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Found document for user:', doc.id, 'mood:', data.mood);
      console.log('Document data:', data);
      searchHistory.push({
        id: doc.id,
        userId: user.uid, // User ID is implicit from the sub-collection path
        mood: data.mood,
        location: data.location,
        searchResults: data.searchResults,
        timestamp: data.timestamp.toDate(),
        createdAt: data.createdAt,
      });
    });

    // Sort by timestamp in JavaScript instead of Firestore
    searchHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log('Retrieved search history:', searchHistory.length, 'items for user:', user.uid);
    
    return searchHistory;
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

// Get search history by mood from sub-collection
export const getSearchHistoryByMood = async (mood: string): Promise<SearchHistoryItem[]> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot fetch search history');
      return [];
    }

    // Query user's sub-collection: users/{userId}/searchHistory
    const userSearchHistoryRef = collection(db, 'users', user.uid, 'searchHistory');
    const q = query(
      userSearchHistoryRef,
      where('mood', '==', mood),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const searchHistory: SearchHistoryItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      searchHistory.push({
        id: doc.id,
        userId: user.uid, // User ID is implicit from the sub-collection path
        mood: data.mood,
        location: data.location,
        searchResults: data.searchResults,
        timestamp: data.timestamp.toDate(),
        createdAt: data.createdAt,
      });
    });

    // Sort by timestamp in JavaScript instead of Firestore
    searchHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log('Retrieved search history for mood:', mood, searchHistory.length, 'items');
    return searchHistory;
  } catch (error) {
    console.error('Error fetching search history by mood:', error);
    return [];
  }
};

// Get user's search history count from sub-collection
export const getUserSearchHistoryCount = async (): Promise<number> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot fetch search history count');
      return 0;
    }

    // Query user's sub-collection: users/{userId}/searchHistory
    const userSearchHistoryRef = collection(db, 'users', user.uid, 'searchHistory');
    const q = query(userSearchHistoryRef);

    const querySnapshot = await getDocs(q);
    console.log('Total search history count for user:', user.uid, 'is:', querySnapshot.size);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching search history count:', error);
    return 0;
  }
};

// Delete a specific search history item
export const deleteSearchHistoryItem = async (searchId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in, cannot delete search history');
      return false;
    }

    console.log('Deleting search history item:', searchId, 'for user:', user.uid);
    
    // Delete from user's sub-collection: users/{userId}/searchHistory/{searchId}
    const userSearchHistoryRef = doc(db, 'users', user.uid, 'searchHistory', searchId);
    await deleteDoc(userSearchHistoryRef);
    
    console.log('Search history item deleted successfully:', searchId);
    return true;
  } catch (error) {
    console.error('Error deleting search history item:', error);
    return false;
  }
};

// Test function to manually save search history in sub-collection
export const testSaveSearchHistory = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user logged in for test');
      return;
    }

    console.log('Testing search history save for user:', user.uid);
    
    const testData = {
      mood: 'Test Mood',
      location: {
        latitude: 41.8781,
        longitude: -87.6298,
      },
      searchResults: {
        places: [],
        totalCount: 0,
      },
      timestamp: new Date(),
      createdAt: Timestamp.now(),
    };

    console.log('Test data to save:', testData);
    
    // Save to user's sub-collection: users/{userId}/searchHistory/{searchId}
    const userSearchHistoryRef = collection(db, 'users', user.uid, 'searchHistory');
    const docRef = await addDoc(userSearchHistoryRef, testData);
    console.log('Test search saved with ID:', docRef.id, 'in sub-collection for user:', user.uid);
    
  } catch (error) {
    console.error('Error in test save:', error);
  }
};
