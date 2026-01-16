const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}`, err);

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';

    res.status(status).json({
        success: false,
        error: {
            message,
            code,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
        timestamp: new Date().toISOString()
    });
};

// Helper pentru crearea erorilor custom
class ApiError extends Error {
    constructor(message, status = 500, code = 'API_ERROR') {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}

module.exports = { errorHandler, ApiError };
