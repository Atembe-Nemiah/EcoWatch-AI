/**
 * EcoWatch AI — Telemetry Service
 */
const { getDatabase } = require('../config/database');

/**
 * Save a telemetry record for a device.
 */
function saveTelemetry(deviceId, data) {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO telemetry (
            device_id,
            sensor_type,
            raw_value,
            voltage_mv,
            temperature_c,
            humidity_rh,
            resistance_ratio,
            wifi_rssi_dbm,
            recorded_at,
            data_label,
            payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const payload = {
        ...data,
        sensor_type: data.sensor_type || 'mq6_analog',
        raw_value: Number(data.raw_value ?? 0),
        voltage_mv: data.voltage_mv != null ? Number(data.voltage_mv) : null,
        temperature_c: data.temperature_c != null ? Number(data.temperature_c) : null,
        humidity_rh: data.humidity_rh != null ? Number(data.humidity_rh) : null,
        resistance_ratio: data.resistance_ratio != null ? Number(data.resistance_ratio) : null,
        wifi_rssi_dbm: data.wifi_rssi_dbm != null ? Number(data.wifi_rssi_dbm) : null,
        recorded_at: data.recorded_at || new Date().toISOString(),
        data_label: data.data_label || 'experimental_raw_reading'
    };

    const result = stmt.run(
        deviceId,
        payload.sensor_type,
        payload.raw_value,
        payload.voltage_mv,
        payload.temperature_c,
        payload.humidity_rh,
        payload.resistance_ratio,
        payload.wifi_rssi_dbm,
        payload.recorded_at,
        payload.data_label,
        JSON.stringify(payload)
    );

    return { id: result.lastInsertRowid, device_id: deviceId, ...payload };
}

/**
 * Get recent telemetry readings for a device.
 */
function getDeviceTelemetry(deviceId, limit = 50) {
    const db = getDatabase();
    return db.prepare(`
        SELECT * FROM telemetry
        WHERE device_id = ?
        ORDER BY recorded_at DESC
        LIMIT ?
    `).all(deviceId, limit);
}

/**
 * Update a device's status and last_seen_at timestamp.
 */
function updateDeviceStatus(deviceId, status) {
    const db = getDatabase();
    db.prepare(`
        UPDATE devices
        SET status = ?, last_seen_at = datetime('now')
        WHERE id = ?
    `).run(status, deviceId);
}

/**
 * Check all devices for stale/offline heartbeats.
 * Marks devices as 'stale' if not seen within 2× heartbeat_interval_seconds,
 * and 'offline' if not seen within 5× heartbeat_interval_seconds.
 */
function checkDeviceHeartbeats() {
    const db = getDatabase();
    const devices = db.prepare(
        `SELECT id, device_code, status, last_seen_at, heartbeat_interval_seconds FROM devices WHERE status IN ('online', 'stale')`
    ).all();

    const now = Date.now();

    for (const device of devices) {
        if (!device.last_seen_at) continue;

        const lastSeen = new Date(device.last_seen_at + 'Z').getTime();
        const intervalMs = (device.heartbeat_interval_seconds || 60) * 1000;
        const elapsed = now - lastSeen;

        if (elapsed > intervalMs * 5 && device.status !== 'offline') {
            db.prepare('UPDATE devices SET status = ? WHERE id = ?').run('offline', device.id);
        } else if (elapsed > intervalMs * 2 && device.status === 'online') {
            db.prepare('UPDATE devices SET status = ? WHERE id = ?').run('stale', device.id);
        }
    }
}

/**
 * Get the most recent telemetry reading for a device.
 */
function getLatestReading(deviceId) {
    const db = getDatabase();
    return db.prepare(`
        SELECT * FROM telemetry
        WHERE device_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
    `).get(deviceId);
}

module.exports = {
    saveTelemetry,
    getDeviceTelemetry,
    updateDeviceStatus,
    checkDeviceHeartbeats,
    getLatestReading
};
