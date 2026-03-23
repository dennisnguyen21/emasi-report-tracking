import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChoQc_QM1l6Zy-fzmW9h5mHrSwn7ITg6M",
  authDomain: "emasi-report-tracking.firebaseapp.com",
  projectId: "emasi-report-tracking",
  storageBucket: "emasi-report-tracking.firebasestorage.app",
  messagingSenderId: "513960948027",
  appId: "1:513960948027:web:5a81eb1a4fbab70bde871e",
  measurementId: "G-1SSKEELBN3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
    }
});

export { app, auth, db };
