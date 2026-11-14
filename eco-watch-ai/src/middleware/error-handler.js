/**
 * EcoWatch AI — Global Error Handler Middleware
 */
function errorHandler(err, _req, res, _next) {
    // Log the error for debugging — omit sensitive fields
    console.error('[EcoWatch Error]', {
        message: err.message,
        status: err.status || err.statusCode || 500,
        timestamp: new Date().toISOString()
    });

    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'File too large',
            message: 'Maximum file size is 10 MB'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Unexpected file field',
            message: err.message
        });
    }

    const statusCode = err.status || err.statusCode || 500;

    // Never expose stack traces or internal paths to the client
    const response = {
        error: statusCode >= 500 ? 'Internal server error' : (err.message || 'Something went wrong')
    };

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
