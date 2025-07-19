import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBGoLFNgxifM3TSBGKZllmDEFGPvWQJI2A",
  authDomain: "ecowatcher-f5470.firebaseapp.com",
  projectId: "ecowatcher-f5470",
  storageBucket: "ecowatcher-f5470.appspot.com",
  messagingSenderId: "554505764957",
  appId: "1:554505764957:web:f5ce326d903e01d2038db4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Cek apakah Auth sudah ada
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { app, db, auth };