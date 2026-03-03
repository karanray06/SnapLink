"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.url}`,
    });
}
