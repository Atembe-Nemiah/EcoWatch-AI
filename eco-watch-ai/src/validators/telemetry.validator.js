/**
 * EcoWatch AI — Telemetry Validator
 */

/**
 * Validate incoming telemetry data from an IoT device.
 */
function validateTelemetry(req, res, next) {
    const errors = [];
    const { device_code, sensor_type, raw_value, voltage_mv, recorded_at, data_label } = req.body;

    // device_code — required
    if (!device_code || typeof device_code !== 'string') {
        errors.push('device_code is required and must be a string');
    }

    // sensor_type — required
    if (!sensor_type || typeof sensor_type !== 'string') {
        errors.push('sensor_type is required and must be a string');
    }

    // raw_value — required, number, 0-4095
    if (raw_value === undefined || raw_value === null) {
        errors.push('raw_value is required');
    } else {
        const num = Number(raw_value);
        if (isNaN(num)) {
            errors.push('raw_value must be a number');
        } else if (num < 0 || num > 4095) {
            errors.push('raw_value must be between 0 and 4095');
        }
    }

    // voltage_mv — optional, must be number if provided
    if (voltage_mv !== undefined && voltage_mv !== null) {
        const v = Number(voltage_mv);
        if (isNaN(v)) {
            errors.push('voltage_mv must be a number');
        }
    }

    // recorded_at — required, must be parseable as ISO date
    if (!recorded_at || typeof recorded_at !== 'string') {
        errors.push('recorded_at is required and must be an ISO date string');
    } else {
        const d = new Date(recorded_at);
        if (isNaN(d.getTime())) {
            errors.push('recorded_at must be a valid ISO date');
        }
    }

    // data_label — required
    if (!data_label || typeof data_label !== 'string') {
        errors.push('data_label is required and must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}

module.exports = { validateTelemetry };
