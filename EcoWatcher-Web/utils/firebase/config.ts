import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  getAuth,
  Auth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGoLFNgxifM3TSBGKZllmDEFGPvWQJI2A",
  authDomain: "ecowatcher-f5470.firebaseapp.com",
  projectId: "ecowatcher-f5470",
  storageBucket: "ecowatcher-f5470.firebasestorage.app",
  messagingSenderId: "554505764957",
  appId: "1:554505764957:web:f5ce326d903e01d2038db4",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export { app, db, auth };
