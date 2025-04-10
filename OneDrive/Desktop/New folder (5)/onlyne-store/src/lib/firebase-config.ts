import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8_agAkfNw0k4pILG5C54cjiR-X3HpLJE",
  authDomain: "onlyne-376bc.firebaseapp.com",
  projectId: "onlyne-376bc",
  storageBucket: "onlyne-376bc.appspot.com",
  messagingSenderId: "1059993029295",
  appId: "1:1059993029295:web:5fcb32ee126f7ffab6a25a",
  measurementId: "G-GBF2QY347B"
};

// Initialize Firebase
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

export { auth, db, storage, googleProvider, signInWithPopup }; 