// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxiPyOREy_JFPs1EtwfwM-yneUevsjH00",
  authDomain: "mood-bytes.firebaseapp.com",
  projectId: "mood-bytes",
  storageBucket: "mood-bytes.firebasestorage.app",
  messagingSenderId: "523876416367",
  appId: "1:523876416367:web:7c36d96d903a6b396d869a",
  measurementId: "G-KR1F7WES56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Log Firebase initialization
console.log('Firebase app initialized:', app.name);
console.log('Firebase auth initialized:', auth.app.name);
console.log('Firebase Firestore initialized:', db.app.name);
console.log('Auth domain:', auth.config.authDomain);

export default app;
