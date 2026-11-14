/**
 * EcoWatch AI — Devices Controller
 */
const { getDatabase } = require('../config/database');
const telemetryService = require('../services/telemetry.service');

/**
 * GET /api/devices — List all devices with last_seen and status.
 */
function getDevices(req, res, next) {
    try {
        const db = getDatabase();
        const devices = db.prepare(
            'SELECT id, device_code, name, location_label, sensor_type, protocol, transport, status, last_seen_at, heartbeat_interval_seconds, created_at FROM devices ORDER BY id'
        ).all();

        res.json({ devices });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/devices/telemetry — Receive telemetry from a device.
 * Device is already authenticated by authenticateDevice middleware.
 */
function receiveTelemetry(req, res, next) {
    try {
        const device = req.device;
        const { sensor_type, raw_value, voltage_mv, recorded_at, data_label } = req.body;

        // Save telemetry reading
        const record = telemetryService.saveTelemetry(device.id, {
            sensor_type,
            raw_value,
            voltage_mv,
            recorded_at,
            data_label
        });

        // Update device status to online
        telemetryService.updateDeviceStatus(device.id, 'online');

        res.status(201).json({
            message: 'Telemetry received',
            telemetry: record
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/devices/:id/telemetry — Get telemetry history for a device.
 */
function getDeviceTelemetry(req, res, next) {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const db = getDatabase();
        const device = db.prepare('SELECT id, device_code, name FROM devices WHERE id = ?').get(Number(id));

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const readings = telemetryService.getDeviceTelemetry(
            Number(id),
            Math.min(200, Math.max(1, parseInt(limit, 10) || 50))
        );

        res.json({ device, readings });
    } catch (err) {
        next(err);
    }
}

module.exports = { getDevices, receiveTelemetry, getDeviceTelemetry };
