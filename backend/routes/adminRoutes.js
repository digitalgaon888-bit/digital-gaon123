const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify admin
const isAdmin = async (req, res, next) => {
    try {
        console.log('--- Incoming Admin Request:', req.path, '---');
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.error('--- Admin Access Blocked: No token ---');
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email }).lean();
        
        if (user && user.role === 'admin') {
            console.log('--- Admin Access Granted:', decoded.email, 'Path:', req.path, '---');
            req.user = decoded;
            next();
        } else {
            console.error('--- Admin Access Denied (Role mismatch or User not found):', decoded.email, '---');
            res.status(403).json({ error: 'Admin access required' });
        }
    } catch (error) {
        console.error('--- Admin Auth Rejected (Token Error) ---');
        console.error('Path:', req.path);
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/stats', isAdmin, adminController.getStats);
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/products', isAdmin, adminController.getAllProducts);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.delete('/products/:id', isAdmin, adminController.deleteProduct);

module.exports = router;
