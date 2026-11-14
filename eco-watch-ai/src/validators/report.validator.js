/**
 * EcoWatch AI — Report Validators
 */

const ALLOWED_CATEGORIES = [
    'organic', 'plastic', 'paper', 'metal',
    'glass', 'mixed', 'hazardous', 'unknown'
];

const ALLOWED_DECISIONS = [
    'confirmed', 'corrected', 'rejected', 'uncertain', 'escalated'
];

/**
 * Validate fields when creating a new report.
 */
function validateCreateReport(req, res, next) {
    const errors = [];
    const { description, location_label, category } = req.body;

    // description — required, min 10 chars
    if (!description || typeof description !== 'string') {
        errors.push('description is required and must be a string');
    } else if (description.trim().length < 10) {
        errors.push('description must be at least 10 characters');
    }

    // location_label — optional string
    if (location_label !== undefined && typeof location_label !== 'string') {
        errors.push('location_label must be a string');
    }

    // category — optional but must be from the allowed list
    if (category !== undefined && category !== null && category !== '') {
        if (!ALLOWED_CATEGORIES.includes(category)) {
            errors.push(`category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}

/**
 * Validate fields when reviewing a report.
 */
function validateReview(req, res, next) {
    const errors = [];
    const { decision, corrected_category, selected_route, notes } = req.body;

    // decision — required
    if (!decision || typeof decision !== 'string') {
        errors.push('decision is required');
    } else if (!ALLOWED_DECISIONS.includes(decision)) {
        errors.push(`decision must be one of: ${ALLOWED_DECISIONS.join(', ')}`);
    }

    // corrected_category — optional but must be valid if provided
    if (corrected_category !== undefined && corrected_category !== null && corrected_category !== '') {
        if (!ALLOWED_CATEGORIES.includes(corrected_category)) {
            errors.push(`corrected_category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
        }
    }

    // selected_route — optional string
    if (selected_route !== undefined && typeof selected_route !== 'string') {
        errors.push('selected_route must be a string');
    }

    // notes — optional string
    if (notes !== undefined && typeof notes !== 'string') {
        errors.push('notes must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}

module.exports = { validateCreateReport, validateReview };
