const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userRecord = await admin.auth().getUser(req.user.uid);
        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Error getting user profile' });
    }
});

// // Logout
// router.post('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('Error destroying session:', err);
//             return res.status(500).json({ error: 'Error logging out' });
//         }
//         res.json({ message: 'Logged out successfully' });
//     });
// });

module.exports = router; 