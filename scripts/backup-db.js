
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";
import path from "path";

const firebaseConfig = {
    apiKey: "AIzaSyChoQc_QM1l6Zy-fzmW9h5mHrSwn7ITg6M",
    authDomain: "emasi-report-tracking.firebaseapp.com",
    projectId: "emasi-report-tracking",
    storageBucket: "emasi-report-tracking.firebasestorage.app",
    messagingSenderId: "513960948027",
    appId: "1:513960948027:web:5a81eb1a4fbab70bde871e",
    measurementId: "G-1SSKEELBN3"
};

import { getAuth, signInAnonymously } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function backup() {
    console.log("Starting database backup...");
    try {
        console.log("Authenticating...");
        await signInAnonymously(auth);
        console.log("Authenticated successfully.");

        const colPath = 'artifacts/emasi-reporting-hub/public/data/report_tracking_requests';
        const colRef = collection(db, ...colPath.split('/'));
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => doc.data());

        const backupPath = path.join(process.cwd(), 'data', 'database-backup.json');

        // Ensure data directory exists
        if (!fs.existsSync(path.dirname(backupPath))) {
            fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        }

        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`Successfully backed up ${data.length} records to ${backupPath}`);
        process.exit(0);
    } catch (error) {
        console.error("Backup failed:", error);
        process.exit(1);
    }
}

backup();
