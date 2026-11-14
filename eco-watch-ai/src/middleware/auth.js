/**
 * EcoWatch AI — Authentication Middleware
 * Simple token-based auth for hackathon prototype
 */
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

/**
 * Authenticate a user via x-user-id header.
 * Falls back to user ID 1 (demo mode) when header is absent.
 */
function authenticateUser(req, res, next) {
    const userId = req.headers['x-user-id'] || 1;
    const db = getDatabase();

    const user = db.prepare('SELECT id, display_name, email, role FROM users WHERE id = ?').get(Number(userId));

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
}

/**
 * Ensure the authenticated user has a reviewer or admin role.
 * Must be called AFTER authenticateUser.
 */
function authenticateReviewer(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'reviewer' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Reviewer or admin role required' });
    }

    next();
}

/**
 * Authenticate an IoT device via x-device-token header.
 * Validates the token against the device_token_hash stored in the DB.
 */
async function authenticateDevice(req, res, next) {
    const token = req.headers['x-device-token'];

    if (!token) {
        return res.status(401).json({ error: 'Device token required (x-device-token header)' });
    }

    const db = getDatabase();
    const deviceCode = req.body.device_code || req.headers['x-device-code'];

    if (!deviceCode) {
        return res.status(400).json({ error: 'Device code required' });
    }

    const device = db.prepare('SELECT id, device_code, device_token_hash, status FROM devices WHERE device_code = ?').get(deviceCode);

    if (!device) {
        return res.status(401).json({ error: 'Device not registered' });
    }

    try {
        const valid = await bcrypt.compare(token, device.device_token_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid device token' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Token verification failed' });
    }

    req.device = device;
    next();
}

module.exports = { authenticateUser, authenticateReviewer, authenticateDevice };
