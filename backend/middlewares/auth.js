// ==================== AUTHENTICATION MIDDLEWARE ====================
// middleware/auth.js (Token Verification)

const { getFirebaseAdmin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Authorization header missing hai!',
                code: 'AUTH_HEADER_MISSING'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token format galat hai! Bearer token chahiye.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }

        // Verify Firebase token
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            authTime: decodedToken.auth_time,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        };

        // Log successful authentication
        console.log(`🔓 User authenticated: ${req.user.email}`);

        next();
    } catch (error) {
        console.error('🔒 Token verification error:', error.message);

        let errorMessage = 'Token verification failed!';
        let errorCode = 'TOKEN_VERIFICATION_FAILED';

        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token expire ho gaya hai! Login dobara karein.';
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.code === 'auth/id-token-revoked') {
            errorMessage = 'Token revoke kar diya gaya hai!';
            errorCode = 'TOKEN_REVOKED';
        } else if (error.code === 'auth/invalid-id-token') {
            errorMessage = 'Invalid token format!';
            errorCode = 'INVALID_TOKEN';
        }

        return res.status(401).json({
            error: errorMessage,
            code: errorCode
        });
    }
};

// Admin verification middleware
const verifyAdmin = async (req, res, next) => {
    try {
        // First verify the token
        await new Promise((resolve, reject) => {
            verifyToken(req, res, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Check if user is admin (you can customize this logic)
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
        
        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({
                error: 'Admin access required hai!',
                code: 'ADMIN_ACCESS_REQUIRED'
            });
        }

        console.log(`👑 Admin access granted: ${req.user.email}`);
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Admin verification failed!',
            code: 'ADMIN_VERIFICATION_FAILED'
        });
    }
};

module.exports = {
    verifyToken,
    verifyAdmin
};
