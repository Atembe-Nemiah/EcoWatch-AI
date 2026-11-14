/**
 * EcoWatch AI — Main Express Server
 */
require('dotenv').config();

const express = require('express');
const path = require('path');
const mqtt = require('mqtt');
const { initializeDatabase, getDatabase } = require('./config/database');
const telemetryService = require('./services/telemetry.service');
const errorHandler = require('./middleware/error-handler');

// Route modules
const reportsRoutes = require('./routes/reports.routes');
const devicesRoutes = require('./routes/devices.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const recoveryRoutes = require('./routes/recovery.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const mqttUrl = process.env.MQTT_URL || 'mqtt://localhost';
const deviceId = 'esp32-001';
const defaultDeviceCode = 'ECOWATCH-ESP32-001';
const latestTelemetry = {
    status: 'online',
    device: { id: deviceId, name: 'EcoWatch ESP32-001' },
    telemetry: {
        raw_adc: 342,
        temperature_c: 24.2,
        humidity_rh: 58.4,
        resistance_ratio: 2.41,
        voltage_v: 1.67,
        wifi_rssi_dbm: -58,
        timestamp: new Date().toISOString()
    }
};

function ensureDeviceRecord() {
    const db = getDatabase();
    const existing = db.prepare('SELECT id, name, device_code, status FROM devices WHERE device_code = ?').get(defaultDeviceCode);

    if (existing) {
        return existing;
    }

    const result = db.prepare(`
        INSERT INTO devices (device_code, name, location_label, device_token_hash, hardware_info, sensor_type, status)
        VALUES (?, ?, ?, ?, ?, ?, 'online')
    `).run(
        defaultDeviceCode,
        'EcoWatch ESP32-001',
        'Campus Building A',
        'local-device-token',
        'ESP32-WROOM-32',
        'mq6_analog'
    );

    return db.prepare('SELECT id, name, device_code, status FROM devices WHERE id = ?').get(result.lastInsertRowid);
}

function buildTelemetryResponse(device, telemetryRow) {
    const safeTelemetry = telemetryRow || {
        raw_value: 342,
        temperature_c: 24.2,
        humidity_rh: 58.4,
        resistance_ratio: 2.41,
        voltage_mv: 1670,
        wifi_rssi_dbm: -58,
        recorded_at: new Date().toISOString()
    };

    return {
        device: {
            id: device?.device_code ? device.device_code.toLowerCase().replace(/[^a-z0-9]+/g, '-') : deviceId,
            name: device?.name || 'EcoWatch ESP32-001'
        },
        status: device?.status || 'online',
        telemetry: {
            raw_adc: Number(safeTelemetry.raw_value ?? safeTelemetry.raw_adc ?? 342),
            temperature_c: safeTelemetry.temperature_c != null ? Number(safeTelemetry.temperature_c) : 24.2,
            humidity_rh: safeTelemetry.humidity_rh != null ? Number(safeTelemetry.humidity_rh) : 58.4,
            resistance_ratio: safeTelemetry.resistance_ratio != null ? Number(safeTelemetry.resistance_ratio) : 2.41,
            voltage_v: safeTelemetry.voltage_mv != null ? Number(safeTelemetry.voltage_mv) / 1000 : 1.67,
            wifi_rssi_dbm: safeTelemetry.wifi_rssi_dbm != null ? Number(safeTelemetry.wifi_rssi_dbm) : -58,
            timestamp: safeTelemetry.recorded_at || new Date().toISOString()
        }
    };
}

const mqttClient = mqtt.connect(mqttUrl, {
    reconnectPeriod: 5000,
    clientId: `ecowatch-node-${Math.random().toString(16).slice(2, 10)}`
});

mqttClient.on('connect', () => {
    console.log(`📡 MQTT connected to ${mqttUrl}`);
    mqttClient.subscribe('ecowatch/esp32/001/telemetry');
    mqttClient.subscribe('ecowatch/esp32/001/status');
    mqttClient.subscribe('ecowatch/command/esp32/001');
});

mqttClient.on('error', (err) => {
    console.warn('⚠️ MQTT unavailable:', err.message || err);
});

mqttClient.on('message', (topic, payload) => {
    try {
        const parsed = JSON.parse(payload.toString());

        if (topic === 'ecowatch/esp32/001/telemetry' || topic === 'ecowatch/esp32/001/status') {
            const device = ensureDeviceRecord();
            const rawValue = parsed.raw_adc ?? parsed.raw_value ?? parsed.value ?? 0;
            const voltageValue = parsed.voltage_v != null ? Number(parsed.voltage_v) * 1000 : (parsed.voltage_mv ?? null);
            const nowIso = parsed.timestamp ? new Date(parsed.timestamp).toISOString() : new Date().toISOString();

            const saved = telemetryService.saveTelemetry(device.id, {
                sensor_type: parsed.sensor_type || 'mq6_analog',
                raw_value: rawValue,
                voltage_mv: voltageValue,
                temperature_c: parsed.temperature_c ?? null,
                humidity_rh: parsed.humidity_rh ?? null,
                resistance_ratio: parsed.resistance_ratio ?? null,
                wifi_rssi_dbm: parsed.wifi_rssi_dbm ?? null,
                recorded_at: nowIso,
                data_label: 'experimental_raw_reading'
            });

            telemetryService.updateDeviceStatus(device.id, parsed.status || 'online');

            latestTelemetry.status = parsed.status || 'online';
            latestTelemetry.telemetry = {
                raw_adc: Number(rawValue),
                temperature_c: parsed.temperature_c ?? latestTelemetry.telemetry.temperature_c,
                humidity_rh: parsed.humidity_rh ?? latestTelemetry.telemetry.humidity_rh,
                resistance_ratio: parsed.resistance_ratio ?? latestTelemetry.telemetry.resistance_ratio,
                voltage_v: parsed.voltage_v ?? latestTelemetry.telemetry.voltage_v,
                wifi_rssi_dbm: parsed.wifi_rssi_dbm ?? latestTelemetry.telemetry.wifi_rssi_dbm,
                timestamp: nowIso
            };

            console.log('💾 Saved device telemetry to database:', saved.id);
        }

        if (topic === 'ecowatch/command/esp32/001') {
            console.log('📲 Command received for ESP32:', parsed);
        }
    } catch (error) {
        console.warn('⚠️ Invalid MQTT payload:', payload.toString());
    }
});

// Initialize database on startup
initializeDatabase();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/devices/esp32-001/telemetry', (req, res) => {
    const db = getDatabase();
    const device = db.prepare('SELECT id, device_code, name, status FROM devices WHERE device_code = ?').get(defaultDeviceCode);
    const latestReading = device
        ? db.prepare(`
            SELECT * FROM telemetry
            WHERE device_id = ?
            ORDER BY recorded_at DESC
            LIMIT 1
        `).get(device.id)
        : null;

    const response = buildTelemetryResponse(device || { name: 'EcoWatch ESP32-001', status: latestTelemetry.status }, latestReading);
    res.json(response);
});

app.post('/api/devices/esp32-001/command', (req, res) => {
    const { command } = req.body || {};

    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    mqttClient.publish('ecowatch/command/esp32/001', JSON.stringify({ command }), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to send command' });
        }

        res.json({ ok: true, command });
    });
});

// Mount routes
app.use('/api/reports', reportsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recovery', recoveryRoutes);

// Global error handler (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🌿 EcoWatch AI server running on http://localhost:${PORT}`);
});

module.exports = app;
