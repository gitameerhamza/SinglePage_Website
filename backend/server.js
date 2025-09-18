// ==================== MAIN SERVER FILE ====================
// server.js (Main Entry Point)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const { initializeFirebase } = require('./config/firebase');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
try {
    initializeFirebase();
} catch (err) {
    console.error('❌ Firebase initialization failed:', err);
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'MERN Firebase Backend Server chal raha hai!',
        version: '1.0.0',
        status: 'Active',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        message: 'API endpoints working hain!',
        status: 'Healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint nahi mila!',
        requestedUrl: req.originalUrl,
        availableRoutes: [
            '/api/health',
            '/api/auth/*',
            '/api/user/*',
            '/api/download/*',
            '/api/admin/*'
        ]
    });
});

// Error handling middleware
app.use(errorHandler);

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 =================================');
    console.log(`📍 Server running on port: ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    console.log(`🔥 Firebase Admin initialized`);
    console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 =================================');
});

module.exports = app;