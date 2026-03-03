import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error(`[Error] ${req.method} ${req.url}:`, err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.url}`,
    });
}
