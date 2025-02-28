import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { RoomModel } from '../models/room';
import { IDatabase } from '../services/database';
import { Room } from '../util/types';

jest.mock('../util/logger');

describe('RoomModel', () => {
    let roomModel: RoomModel;
    let mockDb: jest.Mocked<IDatabase>;

    const mockRoomData = {
        id: 1,
        room_number: '101',
        floor: 1,
        is_booked: false,
        isavailable: true
    };

    const expectedRoom: Room = {
        id: 1,
        roomNumber: '101',
        floor: 1,
        isBooked: false,
        isAvailable: true
    };

    beforeEach(() => {
        mockDb = {
            connect: jest.fn() as jest.MockedFunction<IDatabase['connect']>,
            query: jest.fn() as jest.MockedFunction<IDatabase['query']>,
        };
        roomModel = new RoomModel(mockDb);
    });

    describe('getAllRooms', () => {
        it('should return all rooms successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockRoomData],
                command: '',
                rowCount: 1,
                oid: 0,
                fields: []
            });

            const result = await roomModel.getAllRooms();

            expect(mockDb.query).toHaveBeenCalledWith(
                'SELECT * FROM rooms ORDER BY floor, room_number'
            );
            expect(result).toEqual([expectedRoom]);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(roomModel.getAllRooms()).rejects.toThrow('Failed to fetch rooms');
        });
    });

    describe('getAvailableToBookRooms', () => {
        it('should return available rooms successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockRoomData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await roomModel.getAvailableToBookRooms();

            expect(mockDb.query).toHaveBeenCalledWith(
                'SELECT * FROM rooms WHERE is_booked = FALSE ORDER BY floor, room_number'
            );
            expect(result).toEqual([expectedRoom]);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(roomModel.getAvailableToBookRooms()).rejects.toThrow(
                'Failed to fetch available rooms'
            );
        });
    });

    describe('getRoomsByIds', () => {
        it('should return rooms for given IDs', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockRoomData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await roomModel.getRoomsByIds([1]);

            expect(mockDb.query).toHaveBeenCalledWith(
                'SELECT * FROM rooms WHERE id = ANY($1) ORDER BY floor, room_number',
                [[1]]
            );
            expect(result).toEqual([expectedRoom]);
        });

        it('should return empty array for empty IDs array', async () => {
            const result = await roomModel.getRoomsByIds([]);

            expect(mockDb.query).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(roomModel.getRoomsByIds([1])).rejects.toThrow(
                'Failed to fetch rooms by IDs'
            );
        });
    });

    describe('updateBookingStatus', () => {
        it('should update room booking status successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockRoomData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await roomModel.updateBookingStatus(1, true);

            expect(mockDb.query).toHaveBeenCalledWith(
                'UPDATE rooms SET is_booked = $1 WHERE id = $2 RETURNING *',
                [true, 1]
            );
            expect(result).toEqual(expectedRoom);
        });

        it('should throw error when room not found', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            await expect(roomModel.updateBookingStatus(999, true)).rejects.toThrow(
                'Failed to update room booking status'
            );
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(roomModel.updateBookingStatus(1, true)).rejects.toThrow(
                'Failed to update room booking status'
            );
        });
    });

    describe('resetAllBookings', () => {
        it('should reset all room bookings successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rowCount: 5,
                rows: [],
                command: '',
                oid: 0,
                fields: []
            });

            const result = await roomModel.resetAllBookings();

            expect(mockDb.query).toHaveBeenCalledWith(
                'UPDATE rooms SET is_booked = FALSE'
            );
            expect(result).toBe(5);
        });

        it('should handle zero rows updated', async () => {
            mockDb.query.mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
                command: '',
                oid: 0,
                fields: []
            });

            const result = await roomModel.resetAllBookings();

            expect(result).toBe(0);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(roomModel.resetAllBookings()).rejects.toThrow(
                'Failed to reset room bookings'
            );
        });
    });

    describe('mapToRoom', () => {
        it('should correctly map database row to Room object', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockRoomData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await roomModel.getAllRooms();

            expect(result[0]).toEqual(expectedRoom);
        });
    });
});