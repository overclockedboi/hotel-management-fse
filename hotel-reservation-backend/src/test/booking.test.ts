import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { BookingModel } from '../models/booking';
import { IDatabase } from '../services/database';
import { Booking } from '../util/types';

jest.mock('../util/logger');

describe('BookingModel', () => {
    let bookingModel: BookingModel;
    let mockDb: jest.Mocked<IDatabase>;

    const mockBookingData = {
        id: 1,
        room_id: 101,
        booking_time: new Date('2024-01-01'),
        username: 'testuser'
    };

    const expectedBooking: Booking = {
        id: 1,
        roomId: 101,
        bookingTime: new Date('2024-01-01'),
        username: 'testuser'
    };

    beforeEach(() => {
        mockDb = {
            connect: jest.fn() as jest.MockedFunction<IDatabase['connect']>,
            query: jest.fn() as jest.MockedFunction<IDatabase['query']>,
        };
        bookingModel = new BookingModel(mockDb);
    });

    describe('createBooking', () => {
        it('should create a booking successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockBookingData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await bookingModel.createBooking(101);

            expect(mockDb.query).toHaveBeenCalledWith(
                'INSERT INTO bookings (room_id) VALUES ($1) RETURNING *',
                [101]
            );
            expect(result).toEqual(expectedBooking);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(bookingModel.createBooking(101)).rejects.toThrow(
                'Failed to create booking'
            );
        });
    });

    describe('getAllBookings', () => {
        it('should return all bookings successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rows: [mockBookingData],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            });

            const result = await bookingModel.getAllBookings();

            expect(mockDb.query).toHaveBeenCalledWith(
                'SELECT * FROM bookings ORDER BY booking_time DESC'
            );
            expect(result).toEqual([expectedBooking]);
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(bookingModel.getAllBookings()).rejects.toThrow(
                'Failed to fetch bookings'
            );
        });
    });

    describe('deleteAllBookings', () => {
        it('should delete all bookings successfully', async () => {
            mockDb.query.mockResolvedValueOnce({
                rowCount: 5,
                rows: [],
                command: '',
                oid: 0,
                fields: []
            });

            const result = await bookingModel.deleteAllBookings();

            expect(mockDb.query).toHaveBeenCalledWith(
                'TRUNCATE bookings RESTART IDENTITY'
            );
            expect(result).toBe(5);
        });



        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(bookingModel.deleteAllBookings()).rejects.toThrow(
                'Failed to delete bookings'
            );
        });
    });

    describe('createBookingsTransaction', () => {
        const roomIds = [101, 102];

        it('should create multiple bookings successfully', async () => {
            // Mock room status update
            mockDb.query.mockResolvedValueOnce({
                rows: [],
                command: '',
                rowCount: null,
                oid: 0,
                fields: []
            })  // First room update
                .mockResolvedValueOnce({
                    rows: [mockBookingData],
                    command: '',
                    rowCount: null,
                    oid: 0,
                    fields: []
                })  // First booking
                .mockResolvedValueOnce({
                    rows: [],
                    command: '',
                    rowCount: null,
                    oid: 0,
                    fields: []
                })  // Second room update
                .mockResolvedValueOnce({
                    rows: [{ ...mockBookingData, id: 2, room_id: 102 }],
                    command: '',
                    rowCount: null,
                    oid: 0,
                    fields: []
                });  // Second booking

            const result = await bookingModel.createBookingsTransaction(roomIds);

            expect(mockDb.query).toHaveBeenCalledTimes(4);
            expect(mockDb.query).toHaveBeenNthCalledWith(1,
                'UPDATE rooms SET is_booked = TRUE WHERE id = $1',
                [101]
            );
            expect(mockDb.query).toHaveBeenNthCalledWith(2,
                'INSERT INTO bookings (room_id) VALUES ($1) RETURNING *',
                [101]
            );
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expectedBooking);
            expect(result[1]).toEqual({
                ...expectedBooking,
                id: 2,
                roomId: 102
            });
        });

        it('should throw error when database query fails', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(bookingModel.createBookingsTransaction(roomIds)).rejects.toThrow();
        });
    });


});