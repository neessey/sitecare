import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging } from "firebase/messaging";



const firebaseConfig = {
  apiKey: "AIzaSyBmf5GRWwdjwIHxqoIu8xMifKFfvoW_-LQ",
  authDomain: "sitecare-2217f.firebaseapp.com",
  projectId: "sitecare-2217f",
  storageBucket: "sitecare-2217f.firebasestorage.app",
  messagingSenderId: "1096055129101",
  appId: "1:1096055129101:web:f395b1449d44f791d24144"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the dedicated database ID
export const db = getFirestore(app, "(default)");

// Initialize Auth
export const auth = getAuth(app);

export const messaging = getMessaging(app);
