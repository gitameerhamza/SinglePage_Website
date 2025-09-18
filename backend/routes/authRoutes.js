// ==================== AUTHENTICATION ROUTES ====================
// routes/authRoutes.js

const express = require('express');
const { getFirebaseAdmin } = require('../config/firebase');
const { validateUserInput } = require('../utils/validation');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Login Route (Token verification route - frontend will handle actual login)
router.post('/verify', verifyToken, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        const userRecord = await admin.auth().getUser(req.user.uid);

        res.json({
            message: 'Token successfully verified!',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime
                }
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            error: 'Token verification mein masla hua!',
            code: 'TOKEN_VERIFICATION_ERROR'
        });
    }
});

// Logout Route (Revoke token)
router.post('/logout', verifyToken, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        await admin.auth().revokeRefreshTokens(req.user.uid);

        console.log(`🚪 User logged out: ${req.user.email}`);

        res.json({
            message: 'Successfully logout ho gaye!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout mein masla hua!',
            code: 'LOGOUT_ERROR'
        });
    }
});

// Create User Route (For initial setup)
router.post('/create-user', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validation = validateUserInput(email, password);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Input validation failed!',
                errors: validation.errors
            });
        }

        const admin = getFirebaseAdmin();

        // Create user
        const userRecord = await admin.auth().createUser({
            email: email.toLowerCase().trim(),
            password: password,
            emailVerified: false,
            disabled: false
        });

        console.log(`👤 New user created: ${userRecord.email}`);

        res.status(201).json({
            message: 'User successfully create ho gaya!',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified
            }
        });
    } catch (error) {
        console.error('User creation error:', error);
        
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                error: 'Is email se user already exists!',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        res.status(500).json({
            error: 'User create nahi ho saka!',
            code: 'USER_CREATION_ERROR'
        });
    }
});

module.exports = router;