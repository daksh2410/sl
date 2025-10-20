// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFjc89R4MW6RVLrgbmN_TS8rhxmHM-XCU",
  authDomain: "sl-final.firebaseapp.com",
  projectId: "sl-final",
  storageBucket: "sl-final.firebasestorage.app",
  messagingSenderId: "612092576887",
  appId: "1:612092576887:web:2405fe5ac1d13b4973f272"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Export for use in other scripts
export { db, auth };