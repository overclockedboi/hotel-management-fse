import { Request, Response } from 'express';
import { ApiResponse, BookingRequest } from '../util/types';
import { RoomService } from '../services/roomServices';
import logger from '../util/logger';

/**
 * Room Controller - Handles HTTP requests related to rooms and bookings
 */
export class RoomController {
    constructor(private roomService: RoomService) { }

    /**
     * Get all rooms
     * @param req Express request
     * @param res Express response
     */
    public getAllRooms = async (_req: Request, res: Response): Promise<void> => {
        try {
            const rooms = await this.roomService.getAllRooms();

            const response: ApiResponse<typeof rooms> = {
                success: true,
                data: rooms
            };

            res.json(response);
        } catch (error) {
            logger.error('Error in getAllRooms controller:', error);

            const response: ApiResponse<null> = {
                success: false,
                message: 'Failed to fetch rooms',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    };

    /**
     * Get all bookings
     * @param req Express request
     * @param res Express response
     * @returns Promise<void>
     **/
    public getAllBookings = async (_req: Request, res: Response): Promise<void> => {
        try {
            const bookings = await this.roomService.getAllBookings();

            const response: ApiResponse<typeof bookings> = {
                success: true,
                data: bookings
            };

            res.json(response);
        }
        catch (error) {
            logger.error('Error in getAllBookings controller:', error);

            const response: ApiResponse<null> = {
                success: false,
                message: 'Failed to fetch bookings',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    };

    /**
     * Book optimal rooms
     * @param req Express request with numberOfRooms in body
     * @param res Express response
     */
    public bookRooms = async (req: Request, res: Response): Promise<void> => {
        try {
            const { numberOfRooms } = req.body as BookingRequest;

            if (!numberOfRooms || numberOfRooms < 1 || numberOfRooms > 5) {
                const response: ApiResponse<null> = {
                    success: false,
                    message: 'Number of rooms must be between 1 and 5'
                };

                res.status(400).json(response);
                return;
            }

            const result = await this.roomService.findAndBookOptimalRooms(numberOfRooms);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result
            };

            res.json(response);
        } catch (error) {
            logger.error('Error in bookRooms controller:', error);

            const response: ApiResponse<null> = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to book rooms'
            };

            const statusCode = error instanceof Error &&
                error.message.includes('Not enough rooms available') ? 400 : 500;

            res.status(statusCode).json(response);
        }
    };

    /**
     * Reset all bookings
     * @param req Express request
     * @param res Express response
     */
    public resetBookings = async (_req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.roomService.resetAllBookings();

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
                message: 'All bookings reset successfully'
            };

            res.json(response);
        } catch (error) {
            logger.error('Error in resetBookings controller:', error);

            const response: ApiResponse<null> = {
                success: false,
                message: 'Failed to reset bookings',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    };

    /**
     * Create random bookings
     * @param req Express request
     * @param res Express response
     */
    public randomizeBookings = async (_req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.roomService.createRandomBookings();

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
                message: 'Random bookings created successfully'
            };

            res.json(response);
        } catch (error) {
            logger.error('Error in randomizeBookings controller:', error);

            const response: ApiResponse<null> = {
                success: false,
                message: 'Failed to create random bookings',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    };
} 