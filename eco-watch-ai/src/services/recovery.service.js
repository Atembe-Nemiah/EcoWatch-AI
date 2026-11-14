/**
 * EcoWatch AI — Recovery Routes Service
 */
const { getDatabase } = require('../config/database');

/**
 * Get recovery routes whose eligible_categories_json contains the given category.
 */
function getRoutesForCategory(category) {
    const db = getDatabase();
    const routes = db.prepare(
        `SELECT * FROM recovery_routes WHERE active = 1`
    ).all();

    // Filter routes whose eligible_categories_json includes the category
    return routes.filter(route => {
        try {
            const categories = JSON.parse(route.eligible_categories_json);
            return Array.isArray(categories) && categories.includes(category);
        } catch {
            return false;
        }
    });
}

/**
 * Get all active recovery routes.
 */
function getAllRoutes() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM recovery_routes WHERE active = 1 ORDER BY route_code').all();
}

/**
 * Get a single recovery route by its route_code.
 */
function getRouteByCode(routeCode) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM recovery_routes WHERE route_code = ?').get(routeCode);
}

module.exports = { getRoutesForCategory, getAllRoutes, getRouteByCode };
