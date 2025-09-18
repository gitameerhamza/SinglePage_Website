
// ==================== ADMIN ROUTES ====================
// routes/adminRoutes.js

const express = require('express');
const { getFirebaseAdmin } = require('../config/firebase');
const { verifyAdmin } = require('../middlewares/auth');
const { validateUserInput } = require('../utils/validation');
    
// ...define your routes here...

const router = express.Router();

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        const listUsersResult = await admin.auth().listUsers(1000);
        
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || 'N/A',
            emailVerified: userRecord.emailVerified,
            disabled: userRecord.disabled,
            metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime
            },
            customClaims: userRecord.customClaims || {}
        }));
        
        res.json({
            users,
            totalUsers: users.length,
            message: `${users.length} users successfully load hue!`
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({
            error: 'Users list nahi mil saki!',
            code: 'USERS_LIST_ERROR'
        });
    }
});

// Create new user
router.post('/create-user', verifyAdmin, async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        
        // Validate required fields
        const validation = validateUserInput(email, password);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Validation failed!',
                errors: validation.errors
            });
        }
        
        const admin = getFirebaseAdmin();
        
        const userRecord = await admin.auth().createUser({
            email: email.toLowerCase().trim(),
            password: password,
            displayName: displayName?.trim() || 'New User',
            emailVerified: false,
            disabled: false
        });
        
        console.log(`👑 Admin created user: ${userRecord.email} by ${req.user.email}`);
        
        res.status(201).json({
            message: 'User successfully create ho gaya!',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified
            }
        });
    } catch (error) {
        console.error('Admin user creation error:', error);
        
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                error: 'Email already exists!',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }
        
        res.status(500).json({
            error: 'User create nahi ho saka!',
            code: 'USER_CREATION_ERROR'
        });
    }
});

// Update user
router.put('/users/:uid', verifyAdmin, async (req, res) => {
    try {
        const { uid } = req.params;
        const { displayName, disabled } = req.body;
        
        if (!uid) {
            return res.status(400).json({
                error: 'User UID required hai!',
                code: 'UID_REQUIRED'
            });
        }
        
        const admin = getFirebaseAdmin();
        const updateData = {};
        
        if (displayName !== undefined) {
            updateData.displayName = displayName.trim();
        }
        
        if (disabled !== undefined) {
            updateData.disabled = Boolean(disabled);
        }

        await admin.auth().updateUser(uid, updateData);

        console.log(`👑 Admin updated user: ${uid} by ${req.user.email}`);
        
        res.json({
            message: 'User successfully update ho gaya!',
            uid,
            updateData
        });
    } catch (error) {
        console.error('User update error:', error);
        res.status(500).json({
            error: 'User update nahi ho saka!',
            code: 'USER_UPDATE_ERROR'
        });
    }
});

// Delete user
router.delete('/users/:uid', verifyAdmin, async (req, res) => {
    try {
        const { uid } = req.params;
        
        if (!uid) {
            return res.status(400).json({
                error: 'User UID required hai!',
                code: 'UID_REQUIRED'
            });
        }
        
        // Prevent admin from deleting themselves
        if (uid === req.user.uid) {
            return res.status(400).json({
                error: 'Apna account delete nahi kar sakte!',
                code: 'CANNOT_DELETE_SELF'
            });
        }
        
        const admin = getFirebaseAdmin();
        await admin.auth().deleteUser(uid);
        
        console.log(`👑 Admin deleted user: ${uid} by ${req.user.email}`);

        res.json({
            message: 'User successfully delete ho gaya!',
            uid
        });
    } catch (error) {
        console.error('User deletion error:', error);
        res.status(500).json({
            error: 'User delete nahi ho saka!',
            code: 'USER_DELETION_ERROR'
        });
    }
});

// System statistics
router.get('/statistics', verifyAdmin, async (req, res) => {
    try {
        const admin = getFirebaseAdmin();
        const listUsersResult = await admin.auth().listUsers(1000);
        
        const totalUsers = listUsersResult.users.length;
        const verifiedUsers = listUsersResult.users.filter(u => u.emailVerified).length;
        const disabledUsers = listUsersResult.users.filter(u => u.disabled).length;
        
        const stats = {
            totalUsers,
            verifiedUsers,
            disabledUsers,
            activeUsers: totalUsers - disabledUsers,
            serverUptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            statistics: stats,
            message: 'Statistics successfully load hui!'
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            error: 'Statistics load nahi ho sake!',
            code: 'STATISTICS_ERROR'
        });
    }
});

module.exports = router;
