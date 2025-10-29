import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userInfo: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userInfo: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load user info from AsyncStorage
        try {
          const storedUserInfo = await AsyncStorage.getItem('userInfo');
          if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
          }
        } catch (error) {
          console.error('Error loading user info:', error);
        }
      } else {
        setUserInfo(null);
        // Clear user info from AsyncStorage
        try {
          await AsyncStorage.removeItem('userInfo');
        } catch (error) {
          console.error('Error clearing user info:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    userInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
