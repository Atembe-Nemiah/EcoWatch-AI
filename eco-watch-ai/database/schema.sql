-- EcoWatch AI Database Schema
-- SQLite with better-sqlite3

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users and reviewer roles
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'reporter' CHECK(role IN ('reporter', 'reviewer', 'admin', 'device_operator')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Waste reports and current review state
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_code TEXT UNIQUE NOT NULL,
    reporter_id INTEGER,
    description TEXT NOT NULL,
    image_path TEXT,
    location_label TEXT,
    category TEXT DEFAULT 'unknown' CHECK(category IN ('organic', 'plastic', 'paper', 'metal', 'glass', 'mixed', 'hazardous', 'unknown')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'analysing', 'analysed', 'reviewed', 'confirmed', 'resolved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);

-- AI analysis results
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    provider TEXT NOT NULL DEFAULT 'gemini',
    category_suggestion TEXT,
    visible_evidence_json TEXT,
    confidence_label TEXT CHECK(confidence_label IN ('low', 'medium', 'high', NULL)),
    uncertainty TEXT,
    route_suggestions_json TEXT,
    human_review_required INTEGER NOT NULL DEFAULT 1,
    raw_response_json TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'unavailable')),
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- Approved recovery pathway catalogue
CREATE TABLE IF NOT EXISTS recovery_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    eligible_categories_json TEXT NOT NULL,
    description TEXT NOT NULL,
    preconditions TEXT,
    excluded_materials TEXT,
    output_description TEXT,
    environmental_considerations TEXT,
    limitations TEXT,
    diversion_rate REAL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Human review and correction history
CREATE TABLE IF NOT EXISTS report_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    decision TEXT NOT NULL CHECK(decision IN ('confirmed', 'corrected', 'rejected', 'uncertain', 'escalated')),
    corrected_category TEXT CHECK(corrected_category IN ('organic', 'plastic', 'paper', 'metal', 'glass', 'mixed', 'hazardous', 'unknown', NULL)),
    selected_route TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (report_id) REFERENCES reports(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Registered ESP32 devices
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location_label TEXT,
    device_token_hash TEXT NOT NULL,
    hardware_info TEXT,
    sensor_type TEXT DEFAULT 'mq6_analog',
    protocol TEXT DEFAULT 'MQTT over TLS',
    transport TEXT DEFAULT 'Campus 802.11n',
    status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'stale', 'maintenance')),
    last_seen_at TEXT,
    heartbeat_interval_seconds INTEGER DEFAULT 60,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Raw experimental sensor readings
CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    sensor_type TEXT NOT NULL DEFAULT 'mq6_analog',
    raw_value REAL NOT NULL,
    voltage_mv REAL,
    temperature_c REAL,
    humidity_rh REAL,
    resistance_ratio REAL,
    wifi_rssi_dbm INTEGER,
    recorded_at TEXT NOT NULL,
    received_at TEXT NOT NULL DEFAULT (datetime('now')),
    data_label TEXT NOT NULL DEFAULT 'experimental_raw_reading',
    payload_json TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Application notifications (not safety alarms)
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER,
    telemetry_id INTEGER,
    report_id INTEGER,
    alert_type TEXT NOT NULL CHECK(alert_type IN ('threshold_exceeded', 'device_offline', 'analysis_failed', 'review_needed', 'system')),
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN ('info', 'warning', 'critical')),
    acknowledged INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (telemetry_id) REFERENCES telemetry(id),
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_report ON ai_analyses(report_id);
CREATE INDEX IF NOT EXISTS idx_report_reviews_report ON report_reviews(report_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_recorded ON telemetry(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

-- Seed: Default admin user (password: admin123 — change in production)
INSERT OR IGNORE INTO users (display_name, email, password_hash, role)
VALUES ('Admin', 'admin@ecowatch.local', '$2a$10$xVqYLGEGy1IQHV1cDKfEauH9HRxVGqFML8RsFqYvPrBp9RqeF3jCK', 'admin');

-- Seed: Default reviewer
INSERT OR IGNORE INTO users (display_name, email, password_hash, role)
VALUES ('Campus Reviewer', 'reviewer@ecowatch.local', '$2a$10$xVqYLGEGy1IQHV1cDKfEauH9HRxVGqFML8RsFqYvPrBp9RqeF3jCK', 'reviewer');

-- Seed: Default ESP32 device (token: ecowatch-esp32-token-001)
INSERT OR IGNORE INTO devices (device_code, name, location_label, device_token_hash, hardware_info, sensor_type, status)
VALUES (
    'ECOWATCH-ESP32-001',
    'EcoWatch ESP32-001',
    'Campus Building A',
    '$2a$10$xVqYLGEGy1IQHV1cDKfEauH9HRxVGqFML8RsFqYvPrBp9RqeF3jCK',
    'ESP32-WROOM-32',
    'mq6_analog',
    'online'
);

-- Seed: Recovery routes catalogue
INSERT OR IGNORE INTO recovery_routes (route_code, title, eligible_categories_json, description, preconditions, excluded_materials, output_description, environmental_considerations, limitations, diversion_rate, active)
VALUES
('composting', 'Composting & High-Quality Digestate / Biogas', '["organic"]', 'Anaerobic digestion pathway for soil conditioning and renewable biogas potential.', 'Source-separated organic feedstock free of contaminants', 'Plastics, metals, glass, hazardous materials', 'Compost, digestate for soil amendment', 'Reduces landfill methane emissions, creates soil conditioner', 'Requires professional facility, not suitable for contaminated organics. Platform indicates potential pathways, not active industrial processing.', 0.85, 1),

('mechanical_recycling', 'Flakes / Mechanical Polymer Pellets', '["plastic"]', 'Extrusion-grade pelletising for circular manufacturing packaging inputs.', 'Clean, sorted single-polymer plastic streams', 'Mixed plastics, contaminated plastics, PVC', 'HDPE/PET polymer pellets suitable for remanufacturing', 'Diverts plastic from landfill and incineration', 'Purity 96.5%. Fibre Retention: 88.7%. Requires material-specific sorting.', 0.887, 1),

('paper_recycling', 'Clean Pulping & Cellulose Packaging', '["paper"]', 'De-inking and hydropulping cycle for secondary moulded pulp protective containers.', 'Clean paper and cardboard, minimal contamination', 'Waxed paper, contaminated paper, thermal paper', 'Recycled paper pulp, packaging material', 'Saves trees, reduces water and energy use vs. virgin pulp', 'Paper can only be recycled a limited number of times before fibres degrade.', 0.75, 1),

('metal_recovery', 'Secondary Smelting Recovery', '["metal"]', 'Direct foundry feed stock yielding reduced energy versus virgin ore extraction.', 'Sorted ferrous or non-ferrous metals', 'Mixed metals with hazardous coatings', 'Recovered metal for reuse in manufacturing', 'Energy savings: Up to 95% vs. virgin. Significant CO2 reduction.', 'Requires proper sorting by metal type. Some alloys difficult to separate.', 0.92, 1),

('glass_recycling', 'Glass Cullet Recovery', '["glass"]', 'Crushing and remelting glass into new containers or construction aggregate.', 'Clean, sorted glass by colour', 'Ceramics, heat-resistant glass, mirrors', 'Glass cullet for new containers or aggregate', 'Glass is infinitely recyclable without quality loss', 'Colour sorting required. Contamination with ceramics causes defects.', 0.80, 1),

('energy_recovery', 'Professionally Managed Controlled Energy Recovery', '["mixed", "plastic"]', 'High-efficiency thermal recovery with strict flue-gas scrubbing standards for non-recyclable fractions, diverting residue from landfill disposal.', 'Non-recyclable waste only, after sorting', 'Hazardous waste, recyclable materials', 'Energy from waste, recovered metals from ash', 'Diverts from landfill, generates energy. Diversion Efficacy: 99.4%. Landfill Avoidance applies.', 'Last resort after recycling. Requires professional facility with emissions controls. Platform indicates potential pathways, not active industrial processing.', 0.994, 1),

('specialist_handling', 'Specialist Hazardous Waste Handling', '["hazardous"]', 'Licensed collection and processing of hazardous materials including batteries, e-waste, chemicals, and medical waste.', 'Proper identification and segregation', 'Do not mix with general waste streams', 'Safe disposal or specialist recovery', 'Prevents environmental contamination and health risks', 'Requires licensed handlers. Never process through ordinary waste streams.', NULL, 1),

('manual_inspection', 'Manual Inspection and Sorting', '["mixed", "unknown"]', 'Human inspection to identify materials before routing to appropriate recovery pathway.', 'Materials that cannot be identified by AI or visual inspection alone', NULL, 'Sorted materials directed to appropriate pathways', 'Ensures correct routing and prevents contamination of recovery streams', 'Requires trained personnel. Time-intensive but necessary for quality control.', NULL, 1);

-- Seed: Demo reports
INSERT OR IGNORE INTO reports (report_code, reporter_id, description, location_label, category, status, created_at)
VALUES
('HREP-0452', 1, 'Collection of food scraps and vegetable trimmings found near campus dining area', 'North Quad Bio-Bin', 'organic', 'analysed', datetime('now', '-13 minutes')),
('HREP-0451', 1, 'Plastic bottles and food containers discarded outside east lab', 'East Lab Loading Dock', 'plastic', 'confirmed', datetime('now', '-46 minutes')),
('HREP-0450', 1, 'Scrap metal pieces and aluminium cans from engineering workshop', 'Engineering Mech Annex', 'metal', 'submitted', datetime('now', '-2 hours')),
('HREP-0449', 1, 'Mixed organic waste from central dining complex composting station', 'Central Dining Complex', 'organic', 'resolved', datetime('now', '-3 hours'));

-- Seed: Demo AI analyses
INSERT OR IGNORE INTO ai_analyses (report_id, provider, category_suggestion, visible_evidence_json, confidence_label, uncertainty, route_suggestions_json, human_review_required, status)
VALUES
(1, 'gemini', 'organic', '["Plant-based food scraps visible", "Vegetable trimmings identified", "No visible contaminants"]', 'high', 'Image cannot establish contamination or exact composition.', '["composting", "anaerobic_digestion_review"]', 1, 'completed'),
(2, 'gemini', 'plastic', '["PET bottles visible", "Food containers appear to be polypropylene", "Labels partially attached"]', 'high', 'Material composition cannot be confirmed from image alone.', '["mechanical_recycling"]', 1, 'completed'),
(3, 'gemini', 'metal', '["Aluminium cans visible", "Metal scraps of various sizes"]', 'medium', 'Exact metal composition cannot be determined from image. May contain mixed alloys.', '["metal_recovery"]', 1, 'completed');

-- Seed: Demo reviews
INSERT OR IGNORE INTO report_reviews (report_id, reviewer_id, decision, corrected_category, selected_route, notes)
VALUES
(2, 2, 'confirmed', NULL, 'mechanical_recycling', 'Confirmed as recyclable PET/PP plastics. Suitable for mechanical recycling pathway.');

-- Seed: Demo telemetry data
INSERT OR IGNORE INTO telemetry (device_id, sensor_type, raw_value, voltage_mv, recorded_at, data_label)
VALUES
(1, 'mq6_analog', 342, 1023, datetime('now', '-1 minute'), 'experimental_raw_reading'),
(1, 'mq6_analog', 338, 1015, datetime('now', '-2 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 345, 1030, datetime('now', '-3 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 340, 1020, datetime('now', '-4 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 335, 1008, datetime('now', '-5 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 350, 1045, datetime('now', '-6 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 348, 1038, datetime('now', '-7 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 332, 998, datetime('now', '-8 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 355, 1060, datetime('now', '-9 minutes'), 'experimental_raw_reading'),
(1, 'mq6_analog', 341, 1022, datetime('now', '-10 minutes'), 'experimental_raw_reading');

