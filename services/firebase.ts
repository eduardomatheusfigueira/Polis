import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI05txk7a5ZaE9tpJZUmo8WxaL_KmQ-cM",
  authDomain: "polis-30cd9.firebaseapp.com",
  projectId: "polis-30cd9",
  storageBucket: "polis-30cd9.firebasestorage.app",
  messagingSenderId: "184019398992",
  appId: "1:184019398992:web:31660472eb073394a6bc55",
  measurementId: "G-Y0ET4LRGL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
