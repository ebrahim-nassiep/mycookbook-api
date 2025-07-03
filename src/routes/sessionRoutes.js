// Session check endpoints
const express = require('express');
const router = express.Router();

// Check current session status
router.get('/session', (req, res) => {
    try {
        if (req.session.authenticated && req.session.user) {
            res.status(200).json({
                authenticated: true,
                user: req.session.user
            });
        } else {
            res.status(401).json({
                authenticated: false,
                message: 'No active session'
            });
        }
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            authenticated: false,
            error: 'Session check failed'
        });
    }
});

// Logout endpoint
router.post('/auth/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.clearCookie('sessionId');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = router;