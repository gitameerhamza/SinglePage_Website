
// ==================== USER ROUTES ====================
// routes/userRoutes.js

const { getFirebaseAdmin } = require('../config/firebase');
const { verifyToken } = require('../middlewares/auth');
const express = require('express');

// ...define your routes here...

const router = express.Router();

// Get current user info
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        const userRecord = await admin.auth().getUser(req.user.uid);

        res.json({
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                displayName: userRecord.displayName || 'User',
                photoURL: userRecord.photoURL || null,
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime,
                    lastRefreshTime: userRecord.metadata.lastRefreshTime
                },
                customClaims: userRecord.customClaims || {}
            }
        });
    } catch (error) {
        console.error('User profile fetch error:', error);
        res.status(500).json({
            error: 'User profile load nahi ho saki!',
            code: 'PROFILE_FETCH_ERROR'
        });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { displayName } = req.body;
        
        if (!displayName || displayName.trim().length === 0) {
            return res.status(400).json({
                error: 'Display name required hai!',
                code: 'DISPLAY_NAME_REQUIRED'
            });
        }
        
        const admin = getFirebaseAdmin();
        await admin.auth().updateUser(req.user.uid, {
            displayName: displayName.trim()
        });

        console.log(`👤 User profile updated: ${req.user.email}`);

        res.json({
            message: 'Profile successfully update ho gaya!',
            displayName: displayName.trim()
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Profile update nahi ho saki!',
            code: 'PROFILE_UPDATE_ERROR'
        });
    }
});

// Delete user account
router.delete('/account', verifyToken, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        await admin.auth().deleteUser(req.user.uid);
        
        console.log(`🗑️ User account deleted: ${req.user.email}`);
        
        res.json({
            message: 'Account successfully delete ho gaya!'
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Account delete nahi ho saka!',
            code: 'ACCOUNT_DELETION_ERROR'
        });
    }
});
module.exports = router;