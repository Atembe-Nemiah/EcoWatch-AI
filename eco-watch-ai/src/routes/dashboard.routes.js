/**
 * EcoWatch AI — Dashboard Routes
 */
const { Router } = require('express');
const { authenticateUser } = require('../middleware/auth');
const { getSummary } = require('../controllers/dashboard.controller');

const router = Router();

// GET /api/dashboard/summary — system overview
router.get('/summary', authenticateUser, getSummary);

module.exports = router;
