/**
 * EcoWatch AI — Devices Routes
 */
const { Router } = require('express');
const { authenticateUser, authenticateDevice } = require('../middleware/auth');
const { validateTelemetry } = require('../validators/telemetry.validator');
const {
    getDevices,
    receiveTelemetry,
    getDeviceTelemetry
} = require('../controllers/devices.controller');

const router = Router();

// GET /api/devices — list all devices
router.get('/', authenticateUser, getDevices);

// POST /api/devices/telemetry — receive telemetry from a device
router.post('/telemetry', authenticateDevice, validateTelemetry, receiveTelemetry);

// GET /api/devices/:id/telemetry — telemetry history for a device
router.get('/:id/telemetry', authenticateUser, getDeviceTelemetry);

module.exports = router;
