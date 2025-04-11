import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC8_agAkfNw0k4pILG5C54cjiR-X3HpLJE",
  authDomain: "onlyne-376bc.firebaseapp.com",
  projectId: "onlyne-376bc",
  storageBucket: "onlyne-376bc.firebasestorage.app",
  messagingSenderId: "1059993029295",
  appId: "1:1059993029295:web:5fcb32ee126f7ffab6a25a",
  measurementId: "G-GBF2QY347B"
};

// Initialize Firebase
let app: any;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;
let analytics: any;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, db, storage, analytics, googleProvider, signInWithPopup }; 