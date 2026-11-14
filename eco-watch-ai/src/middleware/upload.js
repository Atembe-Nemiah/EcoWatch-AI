/**
 * EcoWatch AI — Multer Upload Configuration
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename(_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    }
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function fileFilter(_req, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF and WebP are allowed.`), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

module.exports = upload;
