import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './firebase';
import { saveUserToFirestore } from './userService';

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

// Add this at the top level of your file
const useProxy = Platform.OS !== 'web';
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'modebytes'
});

// Google Auth Configuration
const googleConfig = {
  expoClientId: '523876416367-7ds56gk28vsshgghpdr485hmt56bpo7u.apps.googleusercontent.com',
  webClientId: '523876416367-7ds56gk28vsshgghpdr485hmt56bpo7u.apps.googleusercontent.com',
  redirectUri,
  scopes: ['openid', 'profile', 'email'],
};

// Debug function to check configuration
const debugAuthConfig = () => {
  console.log('=== AUTH CONFIGURATION DEBUG ===');
  console.log('Platform:', Platform.OS);
  console.log('Redirect URI:', redirectUri);
  console.log('Client ID:', googleConfig.webClientId);
  console.log('Firebase Auth Domain:', auth.config.authDomain);
  console.log('=== END DEBUG ===');
};

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Save user data to Firestore
    await saveUserToFirestore(userCredential.user);
    
    console.log('Email/Password Sign-In successful!');
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.log('Email/Password Sign-In Error:', error);
    
    let errorMessage = 'Sign-in failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save user data to Firestore
    await saveUserToFirestore(userCredential.user);
    
    console.log('Email/Password Sign-Up successful!');
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.log('Email/Password Sign-Up Error:', error);
    
    let errorMessage = 'Sign-up failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Google Authentication - Fixed Implementation
export const signInWithGoogle = async () => {
  try {
    console.log('Platform:', Platform.OS);
    
    // Call debug function to verify configuration
    debugAuthConfig();
    
    if (Platform.OS === 'web') {
      // Web platform
      console.log('Using Firebase signInWithPopup (web platform)');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user);
      return { user: result.user, error: null };
      
    } else {
      // Mobile platform - use the corrected implementation
      return await signInWithGoogleMobile();
    }
    
  } catch (error: any) {
    console.log('Google Sign-In Error:', error);
    let errorMessage = 'Google Sign-In failed. Please try again.';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Google Sign-In was cancelled.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    return { user: null, error: errorMessage };
  }
};

const signInWithGoogleMobile = async () => {
  try {
    console.log('Starting mobile Google sign-in...');
    console.log('Redirect URI:', redirectUri);
    console.log('Using proxy:', useProxy);

    // Create discovery document for Google
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    // Create auth request manually
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleConfig.webClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20profile%20email&` +
      `access_type=offline&` +
      `prompt=select_account`;

    console.log('Opening Google OAuth URL...');

    // Open auth session
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
      preferEphemeralSession: false, // Set to true if you want no cookies saved
      showInRecents: false,
    });

    console.log('WebBrowser result type:', result.type);

    if (result.type === 'success' && result.url) {
      console.log('OAuth flow successful!');
      
      // Parse the URL to get the authorization code
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      
      console.log('Authorization code received:', code ? 'yes' : 'no');

      if (!code) {
        // Check for error in URL
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');
        console.log('OAuth error:', error, errorDescription);
        return { user: null, error: errorDescription || 'Authorization failed' };
      }

      console.log('Exchanging code for token...');

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleConfig.webClientId,
          client_secret: '', // Not needed for mobile apps
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      console.log('Token response status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.log('Token exchange error:', errorData);
        return { user: null, error: 'Failed to exchange authorization code' };
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful, ID token received:', !!tokenData.id_token);

      if (tokenData.id_token) {
        // Create Firebase credential
        const credential = GoogleAuthProvider.credential(tokenData.id_token);
        const userCredential = await signInWithCredential(auth, credential);
        await saveUserToFirestore(userCredential.user);
        
        console.log('Firebase sign-in successful!');
        return { user: userCredential.user, error: null };
      } else {
        return { user: null, error: 'No ID token received from Google' };
      }
      
    } else if (result.type === 'cancel') {
      console.log('User cancelled OAuth flow');
      return { user: null, error: 'Google Sign-In was cancelled.' };
    } else {
      console.log('OAuth flow failed:', result.type);
      return { user: null, error: 'Google Sign-In failed. Please try again.' };
    }

  } catch (error: any) {
    console.log('Mobile Google Sign-In Error:', error);
    console.log('Error stack:', error.stack);
    
    return { user: null, error: error.message || 'Google Sign-In failed' };
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('Sign-out successful!');
    return { success: true, error: null };
  } catch (error: any) {
    console.log('Sign-out Error:', error);
    return { success: false, error: error.message };
  }
};

// Get Current User
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};