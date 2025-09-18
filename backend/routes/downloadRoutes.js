
// ==================== DOWNLOAD ROUTES ====================
// routes/downloadRoutes.js

const express = require('express');
const { verifyToken } = require('../middlewares/auth');

// ...define your routes here...

const router = express.Router();

// Download packages configuration
const DOWNLOAD_PACKAGES = {
    'basic': {
        name: 'Basic Package',
        description: 'Basic files aur resources',
        fileId: process.env.BASIC_FILE_ID || 'YOUR_BASIC_FILE_ID',
        size: '50 MB',
        downloadUrl: ''
    },
    'premium': {
        name: 'Premium Package', 
        description: 'Advanced features aur tools',
        fileId: process.env.PREMIUM_FILE_ID || 'YOUR_PREMIUM_FILE_ID',
        size: '150 MB',
        downloadUrl: ''
    },
    'complete': {
        name: 'Complete Package',
        description: 'Sab kuch included',
        fileId: process.env.COMPLETE_FILE_ID || 'YOUR_COMPLETE_FILE_ID',
        size: '300 MB',
        downloadUrl: ''
    }
};

// Generate download URLs
Object.keys(DOWNLOAD_PACKAGES).forEach(key => {
    const fileId = DOWNLOAD_PACKAGES[key].fileId;
    DOWNLOAD_PACKAGES[key].downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
});

// Get available packages
router.get('/packages', verifyToken, (req, res) => {
    try {
        const packages = Object.keys(DOWNLOAD_PACKAGES).map(key => ({
            id: key,
            name: DOWNLOAD_PACKAGES[key].name,
            description: DOWNLOAD_PACKAGES[key].description,
            size: DOWNLOAD_PACKAGES[key].size
        }));
        
        res.json({
            packages,
            totalPackages: packages.length,
            message: 'Available packages successfully load hue!'
        });
    } catch (error) {
        console.error('Packages fetch error:', error);
        res.status(500).json({
            error: 'Packages load nahi ho sake!',
            code: 'PACKAGES_FETCH_ERROR'
        });
    }
});

// Generate download link
router.post('/generate-link', verifyToken, async (req, res) => {
    try {
        const { packageId } = req.body;

        if (!packageId) {
            return res.status(400).json({
                error: 'Package ID required hai!',
                code: 'PACKAGE_ID_REQUIRED'
            });
        }
        
        if (!DOWNLOAD_PACKAGES[packageId]) {
            return res.status(400).json({
                error: 'Invalid package ID!',
                code: 'INVALID_PACKAGE_ID',
                availablePackages: Object.keys(DOWNLOAD_PACKAGES)
            });
        }
        
        const packageInfo = DOWNLOAD_PACKAGES[packageId];
        
        // Log download request
        console.log(`📥 Download request: ${req.user.email} - ${packageInfo.name}`);
        
        res.json({
            message: 'Download link successfully generate hui!',
            package: {
                id: packageId,
                name: packageInfo.name,
                description: packageInfo.description,
                size: packageInfo.size,
                downloadUrl: packageInfo.downloadUrl,
                fileName: `${packageId}-package.zip`
            },
            user: {
                email: req.user.email,
                uid: req.user.uid
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Download link generation error:', error);
        res.status(500).json({
            error: 'Download link generate nahi ho saki!',
            code: 'DOWNLOAD_LINK_ERROR'
        });
    }
});

// Download statistics (optional)
router.get('/stats', verifyToken, (req, res) => {
    try {
        // In real app, yeh database se aayega
        const stats = {
            totalDownloads: 0,
            userDownloads: 0,
            lastDownload: null,
            popularPackage: 'premium',
            availablePackages: Object.keys(DOWNLOAD_PACKAGES).length
        };
        
        res.json({
            stats,
            message: 'Download statistics successfully load hui!'
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({
            error: 'Statistics load nahi ho sake!',
            code: 'STATS_FETCH_ERROR'
        });
    }
});

module.exports = router;