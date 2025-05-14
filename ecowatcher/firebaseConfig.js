// ecowatcher/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGoLFNgxifM3TSBGKZllmDEFGPvWQJI2A",
  authDomain: "ecowatcher-f5470.firebaseapp.com",
  projectId: "ecowatcher-f5470",
  storageBucket: "ecowatcher-f5470.firebasestorage.app",
  messagingSenderId: "554505764957",
  appId: "1:554505764957:web:f5ce326d903e01d2038db4"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore
const db = getFirestore(app);

// Inisialisasi Auth dengan AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Export app, db, and auth
export { app, db, auth };
