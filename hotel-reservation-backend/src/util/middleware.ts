import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
};

export const unknownEndpoint = (_res: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
};

export const errorHandler = (
    error: any,
    _res: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error('Error handler:', error.message);

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'An unexpected error occurred: ' + error.message
    });
};

export const validateBookingRequest = (req: Request, res: Response, next: NextFunction) => {
    const { numberOfRooms } = req.body;

    if (!numberOfRooms || isNaN(numberOfRooms) || numberOfRooms < 1 || numberOfRooms > 5) {
        return res.status(400).json({
            success: false,
            message: 'Number of rooms must be between 1 and 5'
        });
    }

    next();
};