import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGoLFNgxifM3TSBGKZllmDEFGPvWQJI2A",
  authDomain: "ecowatcher-f5470.firebaseapp.com",
  projectId: "ecowatcher-f5470",
  storageBucket: "ecowatcher-f5470.appspot.com",
  messagingSenderId: "554505764957",
  appId: "1:554505764957:web:f5ce326d903e01d2038db4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { app, db, auth }; 