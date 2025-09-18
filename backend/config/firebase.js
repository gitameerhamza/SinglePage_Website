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
        // Service Account Key Path
        const serviceAccount = require('../serviceAccountKey.json');

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