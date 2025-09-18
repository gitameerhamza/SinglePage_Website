
// ==================== ERROR HANDLER MIDDLEWARE ====================
// middleware/errorHandler.js

const errorHandler = (error, req, res, next) => {
    console.error('💥 Server Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Default error response
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error!';

    // Firebase specific errors
    if (error.code && error.code.startsWith('auth/')) {
        statusCode = 401;
        
        switch (error.code) {
            case 'auth/email-already-exists':
                message = 'Email already registered hai!';
                break;
            case 'auth/invalid-email':
                message = 'Email format galat hai!';
                break;
            case 'auth/weak-password':
                message = 'Password kam se kam 6 characters ka hona chahiye!';
                break;
            case 'auth/user-not-found':
                message = 'User nahi mila!';
                break;
            default:
                message = 'Authentication error!';
        }
    }

    res.status(statusCode).json({
        error: message,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

module.exports = errorHandler;
