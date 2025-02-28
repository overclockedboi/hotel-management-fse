import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RoomService } from '../services/roomServices';
import { RoomModel } from '../models/room';
import { BookingModel } from '../models/booking';
import { Room } from '../util/types';
import { IDatabase } from '../services/database';

// Mock dependencies
jest.mock('../models/room');
jest.mock('../models/booking');
jest.mock('../util/logger');

describe('RoomService', () => {
    let roomService: RoomService;
    let roomModel: jest.Mocked<RoomModel>;
    let bookingModel: jest.Mocked<BookingModel>;

    const mockRooms: Room[] = [
        {
            id: 1, roomNumber: '101', floor: 1, isAvailable: true,
            isBooked: false
        },
        {
            id: 2, roomNumber: '102', floor: 1, isAvailable: true,
            isBooked: false
        },
        {
            id: 3, roomNumber: '103', floor: 1, isAvailable: true,
            isBooked: false
        },
        {
            id: 4, roomNumber: '201', floor: 2, isAvailable: true,
            isBooked: false
        },
        {
            id: 5, roomNumber: '202', floor: 2, isAvailable: true,
            isBooked: false
        }
    ];

    beforeEach(() => {
        const mockDb = {} as IDatabase;
        roomModel = new RoomModel(mockDb) as jest.Mocked<RoomModel>;
        bookingModel = new BookingModel(mockDb) as jest.Mocked<BookingModel>;
        roomService = new RoomService(roomModel, bookingModel);
    });

    describe('getAllRooms', () => {
        it('should return all rooms', async () => {
            roomModel.getAllRooms.mockResolvedValue(mockRooms);
            const result = await roomService.getAllRooms();
            expect(result).toEqual(mockRooms);
            expect(roomModel.getAllRooms).toHaveBeenCalled();
        });
    });

    describe('resetAllBookings', () => {
        it('should reset all bookings and return counts', async () => {
            roomModel.resetAllBookings.mockResolvedValue(5);
            bookingModel.deleteAllBookings.mockResolvedValue(3);

            const result = await roomService.resetAllBookings();

            expect(result).toEqual({
                roomsReset: 5,
                bookingsDeleted: 3
            });
        });
    });

    describe('findAndBookOptimalRooms', () => {
        it('should throw error if number of rooms is invalid', async () => {
            await expect(roomService.findAndBookOptimalRooms(0))
                .rejects
                .toThrow('Number of rooms must be between 1 and 5');

            await expect(roomService.findAndBookOptimalRooms(6))
                .rejects
                .toThrow('Number of rooms must be between 1 and 5');
        });

        it('should throw error if not enough rooms available', async () => {
            roomModel.getAvailableToBookRooms.mockResolvedValue([mockRooms[0]]);

            await expect(roomService.findAndBookOptimalRooms(2))
                .rejects
                .toThrow('Not enough rooms available');
        });

        it('should book optimal rooms on same floor', async () => {
            const availableRooms = mockRooms.slice(0, 3); // First 3 rooms on floor 1
            roomModel.getAvailableToBookRooms.mockResolvedValue(availableRooms);
            bookingModel.createBookingsTransaction.mockResolvedValue([]);

            const result = await roomService.findAndBookOptimalRooms(2);

            expect(result.rooms.length).toBe(2);
            expect(result.rooms[0].floor).toBe(result.rooms[1].floor);
            expect(result.totalTravelTime).toBe(1); // Adjacent rooms on same floor
        });
    });

    describe('calculateTotalTravelTime', () => {
        it('should return 0 for single room', () => {
            const result = (roomService as any).calculateTotalTravelTime([mockRooms[0]]);
            expect(result).toBe(0);
        });

        it('should calculate horizontal travel time on same floor', () => {
            const result = (roomService as any).calculateTotalTravelTime([
                { roomNumber: '101', floor: 1 },
                { roomNumber: '103', floor: 1 }
            ]);
            expect(result).toBe(2); // 2 rooms apart
        });

        it('should calculate total travel time across floors', () => {
            const result = (roomService as any).calculateTotalTravelTime([
                { roomNumber: '101', floor: 1 },
                { roomNumber: '201', floor: 2 }
            ]);
            expect(result).toBe(4); // 2 minutes vertical + 1 + 1 horizontal
        });
    });

    describe('createRandomBookings', () => {
        it('should create random bookings successfully', async () => {
            roomModel.getAllRooms.mockResolvedValue(mockRooms);
            bookingModel.createBookingsTransaction.mockResolvedValue([]);

            const result = await roomService.createRandomBookings();

            expect(result).toHaveProperty('bookedRooms');
            expect(typeof result.bookedRooms).toBe('number');
            expect(result.bookedRooms).toBeLessThanOrEqual(mockRooms.length);
        });

        it('should handle errors during random booking creation', async () => {
            roomModel.getAllRooms.mockRejectedValue(new Error('Database error'));

            await expect(roomService.createRandomBookings())
                .rejects
                .toThrow('Failed to create random bookings');
        });
    });
});