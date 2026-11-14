/**
 * EcoWatch AI — Reports Controller
 */
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const aiService = require('../services/ai.service');

/**
 * POST /api/reports — Create a new waste report.
 */
async function createReport(req, res, next) {
    try {
        const db = getDatabase();
        const { description, location_label, category } = req.body;

        const reportCode = `HREP-${String(Date.now()).slice(-4)}`;
        const imagePath = req.file ? req.file.filename : null;
        const reporterId = req.headers['x-user-id'] || 1;

        const stmt = db.prepare(`
            INSERT INTO reports (report_code, reporter_id, description, image_path, location_label, category, status)
            VALUES (?, ?, ?, ?, ?, ?, 'submitted')
        `);

        const result = stmt.run(
            reportCode,
            Number(reporterId),
            description.trim(),
            imagePath,
            location_label || null,
            category || 'unknown'
        );

        const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Report created successfully',
            report
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/reports — List reports with search, filter, and pagination.
 */
function getReports(req, res, next) {
    try {
        const db = getDatabase();
        const { search, category, status, page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (description LIKE ? OR location_label LIKE ? OR report_code LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        const total = db.prepare(`SELECT COUNT(*) as count FROM reports ${whereClause}`).get(...params).count;
        const reports = db.prepare(`SELECT * FROM reports ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

        res.json({
            reports,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/reports/:id — Get a single report with AI analysis and review history.
 */
function getReportById(req, res, next) {
    try {
        const db = getDatabase();
        const { id } = req.params;

        const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(id));
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const analyses = db.prepare('SELECT * FROM ai_analyses WHERE report_id = ? ORDER BY created_at DESC').all(Number(id));
        const reviews = db.prepare('SELECT * FROM report_reviews WHERE report_id = ? ORDER BY created_at DESC').all(Number(id));

        res.json({ report, analyses, reviews });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/reports/:id/analyse — Trigger AI analysis for a report.
 */
async function analyseReport(req, res, next) {
    try {
        const db = getDatabase();
        const { id } = req.params;

        const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(id));
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Update report status to analysing
        db.prepare("UPDATE reports SET status = 'analysing', updated_at = datetime('now') WHERE id = ?").run(Number(id));

        // Build full image path
        const imagePath = report.image_path
            ? path.join(__dirname, '..', '..', 'uploads', report.image_path)
            : null;

        // Run AI analysis
        const result = await aiService.analyseReport(imagePath, report.description);

        // Save analysis record
        const stmt = db.prepare(`
            INSERT INTO ai_analyses (report_id, provider, category_suggestion, visible_evidence_json,
                confidence_label, uncertainty, route_suggestions_json, human_review_required,
                raw_response_json, status, error_message)
            VALUES (?, 'gemini', ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `);

        stmt.run(
            Number(id),
            result.category || null,
            result.visible_evidence ? JSON.stringify(result.visible_evidence) : null,
            result.confidence_label || null,
            result.uncertainty || null,
            result.suggested_routes ? JSON.stringify(result.suggested_routes) : null,
            JSON.stringify(result),
            result.status,
            result.error || null
        );

        // Update report status based on result
        const newStatus = result.status === 'completed' ? 'analysed' : 'submitted';
        db.prepare("UPDATE reports SET status = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, Number(id));

        // Optionally update the category suggestion
        if (result.status === 'completed' && result.category) {
            db.prepare("UPDATE reports SET category = ?, updated_at = datetime('now') WHERE id = ?").run(result.category, Number(id));
        }

        res.json({
            message: `Analysis ${result.status}`,
            analysis: result
        });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/reports/:id/review — Save a reviewer decision.
 */
function reviewReport(req, res, next) {
    try {
        const db = getDatabase();
        const { id } = req.params;
        const { decision, corrected_category, selected_route, notes } = req.body;

        const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(id));
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Insert review record
        const reviewStmt = db.prepare(`
            INSERT INTO report_reviews (report_id, reviewer_id, decision, corrected_category, selected_route, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        reviewStmt.run(
            Number(id),
            req.user.id,
            decision,
            corrected_category || null,
            selected_route || null,
            notes || null
        );

        // Map decision to report status
        const statusMap = {
            confirmed: 'confirmed',
            corrected: 'confirmed',
            rejected: 'rejected',
            uncertain: 'analysed',
            escalated: 'analysed'
        };
        const newStatus = statusMap[decision] || 'analysed';

        db.prepare("UPDATE reports SET status = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, Number(id));

        // If category was corrected, update it
        if (corrected_category) {
            db.prepare("UPDATE reports SET category = ?, updated_at = datetime('now') WHERE id = ?").run(corrected_category, Number(id));
        }

        const updatedReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(id));

        res.json({
            message: 'Review saved successfully',
            report: updatedReport
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { createReport, getReports, getReportById, analyseReport, reviewReport };
