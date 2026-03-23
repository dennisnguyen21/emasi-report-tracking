import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDZ5mdC-vN1htusotzyfS4bFIkxzGmbywE",
    authDomain: "emasi-reporting-hub.firebaseapp.com",
    projectId: "emasi-reporting-hub",
    storageBucket: "emasi-reporting-hub.firebasestorage.app",
    messagingSenderId: "899744144586",
    appId: "1:899744144586:web:16c51b955895ede0a02833",
    measurementId: "G-4SSY727EGR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else if (err.code == 'unimplemented') {
        console.warn("The current browser does not support all of the features required to enable persistence.");
    }
});

export { app, auth, db };
