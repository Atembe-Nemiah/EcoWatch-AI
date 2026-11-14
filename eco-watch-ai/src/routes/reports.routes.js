/**
 * EcoWatch AI — Reports Routes
 */
const { Router } = require('express');
const upload = require('../middleware/upload');
const { authenticateUser, authenticateReviewer } = require('../middleware/auth');
const { validateCreateReport, validateReview } = require('../validators/report.validator');
const {
    createReport,
    getReports,
    getReportById,
    analyseReport,
    reviewReport
} = require('../controllers/reports.controller');

const router = Router();

// POST /api/reports — create report with optional image upload
router.post('/', upload.single('image'), validateCreateReport, createReport);

// GET /api/reports — list reports (with search / filter / pagination)
router.get('/', authenticateUser, getReports);

// GET /api/reports/:id — single report with analyses & reviews
router.get('/:id', authenticateUser, getReportById);

// POST /api/reports/:id/analyse — trigger AI analysis
router.post('/:id/analyse', authenticateUser, analyseReport);

// PATCH /api/reports/:id/review — submit reviewer decision
router.patch('/:id/review', authenticateUser, authenticateReviewer, validateReview, reviewReport);

module.exports = router;
