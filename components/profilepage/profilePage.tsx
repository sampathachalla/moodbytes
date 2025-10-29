import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { deleteUser } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getCurrentUser, signOutUser } from '../../services/auth';
import { auth, db } from '../../services/firebase';
import { getUserFromFirestore, UserData } from '../../services/userService';

interface ProfilePageProps {
  refreshTrigger?: number; // Add a prop to trigger refresh
}

export default function ProfilePage({ refreshTrigger }: ProfilePageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, [refreshTrigger]); // Refresh when refreshTrigger changes

  const loadUserData = async () => {
    try {
      console.log('ProfilePage: Loading user data, refreshTrigger:', refreshTrigger);
      setLoading(true);
      const user = getCurrentUser();
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      const userProfile = await getUserFromFirestore(user.uid);
      console.log('ProfilePage: Loaded user profile:', userProfile?.totalSearches);
      setUserData(userProfile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileOptions = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: 'user',
      color: '#D7263D',
    },
    {
      id: 2,
      title: 'Settings',
      icon: 'cog',
      color: '#7A7A7A',
    },
    {
      id: 3,
      title: 'Notifications',
      icon: 'bell',
      color: '#7A7A7A',
    },
  ];

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Sign out from Firebase
      const { error } = await signOutUser();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userInfo');
      
      // Navigate to login screen
      router.replace('/auth/login');
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


  const deleteAllUserData = async (userId: string) => {
    console.log('Starting comprehensive user data deletion for:', userId);
    
    try {
      // Delete user's search history sub-collection
      console.log('Deleting search history sub-collection...');
      const searchHistoryRef = collection(db, 'users', userId, 'searchHistory');
      const searchHistorySnapshot = await getDocs(searchHistoryRef);
      
      console.log(`Found ${searchHistorySnapshot.size} search history documents`);
      
      // Delete each search history document
      const deletePromises = [];
      searchHistorySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
        console.log(`Deleting search history document: ${doc.id}`);
      });
      
      await Promise.all(deletePromises);
      console.log('All search history documents deleted');

      // Delete user's main document
      console.log('Deleting user main document...');
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      console.log('User main document deleted');

      console.log('All Firestore data deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user data from Firestore:', error);
      throw error;
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      console.log('confirmDeleteAccount called');
      setDeleting(true);
      
      const user = getCurrentUser();
      console.log('User from getCurrentUser:', user);
      
      if (!user) {
        console.log('No user found');
        Alert.alert('Error', 'No user logged in');
        setDeleting(false);
        return;
      }

      console.log('Deleting account for user:', user.uid);
      console.log('Current user:', auth.currentUser);

      // Check if user is authenticated
      if (!auth.currentUser) {
        Alert.alert('Error', 'User authentication expired. Please log in again.');
        setDeleting(false);
        return;
      }

      // Delete all user data from Firestore (including sub-collections)
      try {
        await deleteAllUserData(user.uid);
        console.log('All user data deleted from Firestore');
      } catch (firestoreError) {
        console.error('Error deleting Firestore data:', firestoreError);
        Alert.alert('Warning', 'Some user data could not be deleted from the database, but continuing with account deletion.');
      }

      // Delete user from Firebase Auth
      try {
        await deleteUser(auth.currentUser);
        console.log('User deleted from Firebase Auth');
      } catch (authError: any) {
        console.error('Error deleting from Firebase Auth:', authError);
        
        // Handle specific Firebase Auth errors
        if (authError.code === 'auth/requires-recent-login') {
          Alert.alert(
            'Authentication Required',
            'For security reasons, you need to log in again before deleting your account. Please log out and log back in, then try again.',
            [{ text: 'OK' }]
          );
          setDeleting(false);
          return;
        } else if (authError.code === 'auth/user-token-expired') {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log out and log back in, then try again.',
            [{ text: 'OK' }]
          );
          setDeleting(false);
          return;
        } else {
          throw authError; // Re-throw other errors
        }
      }

      // Clear AsyncStorage
      await AsyncStorage.removeItem('userInfo');
      console.log('AsyncStorage cleared');

      // Navigate to login screen
      router.replace('/auth/login');

      Alert.alert('Success', 'Your account and all data have been deleted successfully');
      console.log('Complete account deletion successful');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      Alert.alert(
        'Error', 
        `Failed to delete account: ${error.message || 'Unknown error'}. Please try again or contact support.`
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D7263D" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load profile data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.profileImageContainer}>
            {userData.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <FontAwesome name="user" size={40} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>{userData.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.joinDate}>Member since {formatDate(userData.createdAt)}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.totalSearches || 0}</Text>
            <Text style={styles.statLabel}>Searches Made</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.optionItem}>
              <View style={styles.optionContent}>
                <FontAwesome name={option.icon} size={20} color={option.color} />
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#C0C0C0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Delete Account Button */}
        <View style={styles.deleteAccountSection}>
          <TouchableOpacity 
            style={[styles.deleteAccountButton, deleting && styles.disabledButton]} 
            onPress={() => {
              console.log('Delete account button pressed');
              confirmDeleteAccount();
            }}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <FontAwesome name="trash" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.deleteAccountText}>
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D7263D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  optionsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteAccountSection: {
    padding: 20,
    paddingBottom: 10,
  },
  deleteAccountButton: {
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  deleteAccountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    backgroundColor: '#D7263D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7A7A7A',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D7263D',
    textAlign: 'center',
  },
});
