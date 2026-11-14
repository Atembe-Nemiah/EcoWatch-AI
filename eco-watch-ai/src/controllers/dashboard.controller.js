/**
 * EcoWatch AI — Dashboard Controller
 */
const { getDatabase } = require('../config/database');
const telemetryService = require('../services/telemetry.service');

const AVG_ORGANIC_KG = 4.1;
const AVG_RECYCLABLE_KG = 2.5;

/**
 * GET /api/dashboard/summary — Returns an overview of the entire system.
 */
function getSummary(req, res, next) {
    try {
        const db = getDatabase();

        // Total reports
        const totalReports = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;

        // Reports by category
        const reportsByCategory = db.prepare(
            'SELECT category, COUNT(*) as count FROM reports GROUP BY category ORDER BY count DESC'
        ).all();

        // Reports by status
        const reportsByStatus = db.prepare(
            'SELECT status, COUNT(*) as count FROM reports GROUP BY status ORDER BY count DESC'
        ).all();

        // Pending analyses (submitted but no completed analysis)
        const pendingAnalyses = db.prepare(
            "SELECT COUNT(*) as count FROM reports WHERE status IN ('submitted', 'analysing')"
        ).get().count;

        // Recovery opportunities — reports with a selected route in reviews
        const recoveryOpportunities = db.prepare(
            'SELECT COUNT(DISTINCT r.id) as count FROM reports r JOIN report_reviews rv ON r.id = rv.report_id WHERE rv.selected_route IS NOT NULL'
        ).get().count;

        // Recent reports (last 10)
        const recentReports = db.prepare(
            'SELECT * FROM reports ORDER BY created_at DESC LIMIT 10'
        ).all();

        // Devices overview
        const devicesOnline = db.prepare(
            "SELECT COUNT(*) as count FROM devices WHERE status = 'online'"
        ).get().count;

        const totalDevices = db.prepare(
            'SELECT COUNT(*) as count FROM devices'
        ).get().count;

        // Latest telemetry for first device
        const firstDevice = db.prepare('SELECT id FROM devices ORDER BY id LIMIT 1').get();
        const latestTelemetry = firstDevice
            ? telemetryService.getLatestReading(firstDevice.id)
            : null;

        // Estimated weights
        const organicCount = db.prepare(
            "SELECT COUNT(*) as count FROM reports WHERE category = 'organic'"
        ).get().count;

        const recyclableCount = db.prepare(
            "SELECT COUNT(*) as count FROM reports WHERE category IN ('plastic', 'paper', 'metal', 'glass')"
        ).get().count;

        const organicWasteKg = parseFloat((organicCount * AVG_ORGANIC_KG).toFixed(1));
        const recyclableRecoveryKg = parseFloat((recyclableCount * AVG_RECYCLABLE_KG).toFixed(1));

        const totalEstimatedKg = organicWasteKg + recyclableRecoveryKg;
        const recoveryRate = totalReports > 0
            ? parseFloat(((recoveryOpportunities / totalReports) * 100).toFixed(1))
            : 0;

        res.json({
            totalReports,
            reportsByCategory,
            reportsByStatus,
            pendingAnalyses,
            recoveryOpportunities,
            recentReports,
            devicesOnline,
            totalDevices,
            latestTelemetry,
            organicWasteKg,
            recyclableRecoveryKg,
            recoveryRate
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSummary };
