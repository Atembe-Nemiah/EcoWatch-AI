/**
 * EcoWatch AI — Recovery Routes
 */
const { Router } = require('express');
const recoveryService = require('../services/recovery.service');

const router = Router();

// GET /api/recovery — list all active recovery routes (public)
router.get('/', (_req, res, next) => {
    try {
        const routes = recoveryService.getAllRoutes();
        res.json({ routes });
    } catch (err) {
        next(err);
    }
});

// GET /api/recovery/:code — get a single route by code (public)
router.get('/:code', (req, res, next) => {
    try {
        const route = recoveryService.getRouteByCode(req.params.code);
        if (!route) {
            return res.status(404).json({ error: 'Recovery route not found' });
        }
        res.json({ route });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
