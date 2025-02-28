import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RoomController } from '../controllers/roomController';
import { RoomService } from '../services/roomServices';
import { Room } from '../util/types';

// Mock RoomService
jest.mock('../services/roomServices');
jest.mock('../util/logger');

describe('RoomController', () => {
    let roomController: RoomController;
    let mockRoomService: jest.Mocked<RoomService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        mockRoomService = new RoomService({} as any, {} as any) as jest.Mocked<RoomService>;
        roomController = new RoomController(mockRoomService);

        jsonMock = jest.fn().mockReturnThis();
        statusMock = jest.fn().mockReturnThis();
        mockResponse = {
            json: jsonMock,
            status: statusMock
        } as unknown as Response;
        mockRequest = {};
    });

    describe('getAllRooms', () => {
        const mockRooms: Room[] = [
            { id: 1, roomNumber: '101', floor: 1, isAvailable: true, isBooked: false },
            { id: 2, roomNumber: '102', floor: 1, isAvailable: true, isBooked: false }
        ];

        it('should return all rooms successfully', async () => {
            mockRoomService.getAllRooms.mockResolvedValue(mockRooms);

            await roomController.getAllRooms(mockRequest as Request, mockResponse as Response);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockRooms
            });
        });

        it('should handle errors when fetching rooms fails', async () => {
            const error = new Error('Database error');
            mockRoomService.getAllRooms.mockRejectedValue(error);

            await roomController.getAllRooms(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to fetch rooms',
                error: 'Database error'
            });
        });
    });

    describe('getAllBookings', () => {
        const mockBookings = [
            { id: 1, roomId: 1, username: "any", bookingTime: new Date() }
        ];

        it('should return all bookings successfully', async () => {
            mockRoomService.getAllBookings.mockResolvedValue(mockBookings);

            await roomController.getAllBookings(mockRequest as Request, mockResponse as Response);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockBookings
            });
        });

        it('should handle errors when fetching bookings fails', async () => {
            const error = new Error('Database error');
            mockRoomService.getAllBookings.mockRejectedValue(error);

            await roomController.getAllBookings(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to fetch bookings',
                error: 'Database error'
            });
        });
    });

    describe('bookRooms', () => {
        const mockBookingResult = {
            rooms: [{ id: 1, roomNumber: '101', floor: 1, isAvailable: true, isBooked: false }],
            totalTravelTime: 0
        };

        it('should book rooms successfully', async () => {
            mockRequest.body = { numberOfRooms: 1 };
            mockRoomService.findAndBookOptimalRooms.mockResolvedValue(mockBookingResult);

            await roomController.bookRooms(mockRequest as Request, mockResponse as Response);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockBookingResult
            });
        });

        it('should return 400 for invalid number of rooms', async () => {
            mockRequest.body = { numberOfRooms: 0 };

            await roomController.bookRooms(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Number of rooms must be between 1 and 5'
            });
        });

        it('should handle not enough rooms available error', async () => {
            mockRequest.body = { numberOfRooms: 2 };
            mockRoomService.findAndBookOptimalRooms.mockRejectedValue(new Error('Not enough rooms available'));

            await roomController.bookRooms(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Not enough rooms available'
            });
        });
    });

    describe('resetBookings', () => {
        const mockResetResult = { roomsReset: 5, bookingsDeleted: 3 };

        it('should reset all bookings successfully', async () => {
            mockRoomService.resetAllBookings.mockResolvedValue(mockResetResult);

            await roomController.resetBookings(mockRequest as Request, mockResponse as Response);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockResetResult,
                message: 'All bookings reset successfully'
            });
        });

        it('should handle errors when resetting bookings fails', async () => {
            const error = new Error('Reset failed');
            mockRoomService.resetAllBookings.mockRejectedValue(error);

            await roomController.resetBookings(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to reset bookings',
                error: 'Reset failed'
            });
        });
    });

    describe('randomizeBookings', () => {
        const mockRandomResult = { bookedRooms: 3 };

        it('should create random bookings successfully', async () => {
            mockRoomService.createRandomBookings.mockResolvedValue(mockRandomResult);

            await roomController.randomizeBookings(mockRequest as Request, mockResponse as Response);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockRandomResult,
                message: 'Random bookings created successfully'
            });
        });

        it('should handle errors when creating random bookings fails', async () => {
            const error = new Error('Randomization failed');
            mockRoomService.createRandomBookings.mockRejectedValue(error);

            await roomController.randomizeBookings(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to create random bookings',
                error: 'Randomization failed'
            });
        });
    });
});