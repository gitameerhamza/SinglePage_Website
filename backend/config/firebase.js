// ==================== FIREBASE CONFIGURATION ====================
// config/firebase.js (Firebase Admin Setup)

const admin = require('firebase-admin');

let isFirebaseInitialized = false;

const initializeFirebase = () => {
    if (isFirebaseInitialized) {
        console.log('🔥 Firebase already initialized');
        return;
    }

    try {
        // Check if service account key exists
        let serviceAccount;
        try {
            serviceAccount = require('../serviceAccountKey.json');
        } catch (error) {
            console.error('❌ Firebase service account key not found!');
            console.log('📝 Please follow these steps to set up Firebase:');
            console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
            console.log('2. Select your project > Project Settings > Service Accounts');
            console.log('3. Click "Generate new private key" and download the JSON file');
            console.log('4. Rename it to "serviceAccountKey.json" and place in backend/ folder');
            console.log('5. Create .env file from .env.example and add your Firebase config');
            throw new Error('Firebase service account key missing');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
            projectId: serviceAccount.project_id
        });

        isFirebaseInitialized = true;
        console.log('🔥 Firebase Admin SDK successfully initialized');
        console.log(`📊 Project ID: ${serviceAccount.project_id}`);
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        process.exit(1);
    }
};

const getFirebaseAdmin = () => {
    if (!isFirebaseInitialized) {
        throw new Error('Firebase not initialized! Call initializeFirebase() first.');
    }
    return admin;
};

module.exports = {
    initializeFirebase,
    getFirebaseAdmin,
    admin
};