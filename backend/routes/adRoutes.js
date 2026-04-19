const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Reuse isAdmin middleware logic
const isAdmin = async (req, res, next) => {
    try {
        console.log('--- ADMIN CHECK ---');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('NO AUTH HEADER PROVIDED');
            return res.status(401).json({ error: 'No Authorization header' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            console.error('INVALID TOKEN FORMAT:', token);
            return res.status(410).json({ error: 'Please log in again as admin' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('DECODED TOKEN EMAIL:', decoded.email);
        
        const user = await User.findOne({ email: decoded.email }).lean();
        if (user && user.role === 'admin') {
            console.log('ADMIN ACCESS GRANTED:', user.email);
            next();
        } else {
            console.error('ADMIN ACCESS DENIED FOR:', decoded.email);
            res.status(403).json({ error: 'Admin access required' });
        }
    } catch (error) {
        console.error('isAdmin MIDDLEWARE CRASH:', error.message);
        res.status(401).json({ error: 'Session expired or invalid token' });
    }
};

// Public route to get active ads
router.get('/active', adController.getActiveAds);

// Admin-only routes
router.get(['/', ''], isAdmin, adController.getAllAds);
router.post(['/', ''], isAdmin, adController.createAd);
router.delete('/:id', isAdmin, adController.deleteAd);
router.patch('/:id/toggle', isAdmin, adController.toggleAdStatus);

module.exports = router;
