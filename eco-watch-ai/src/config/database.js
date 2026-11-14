/**
 * EcoWatch AI — Database Configuration
 * SQLite with better-sqlite3
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './data/ecowatch.sqlite';
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');

let db;

function getDatabase() {
    if (db) return db;

    // Ensure data directory exists
    const dataDir = path.dirname(path.resolve(DB_PATH));
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(path.resolve(DB_PATH));

    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    return db;
}

function initializeDatabase() {
    const database = getDatabase();
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

    try {
        database.exec(schema);
    } catch (err) {
        console.error('Schema initialization failed:', err.message);
        throw err;
    }

    console.log('✅ Database initialized successfully');
    return database;
}

function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}

module.exports = { getDatabase, initializeDatabase, closeDatabase };

