import { Booking } from '../util/types';
import { IDatabase } from '../services/database';

import logger from '../util/logger';

/**
 * Booking Model - Handles database operations for bookings
 */
export class BookingModel {

    constructor(private db: IDatabase) {

    }

    /**
     * Create a new booking for a room
     * @param roomId ID of the room to book
     * @returns Promise<Booking> The created booking
     */
    public async createBooking(roomId: number): Promise<Booking> {
        try {
            const result = await this.db.query(
                'INSERT INTO bookings (room_id) VALUES ($1) RETURNING *',
                [roomId]
            );

            return this.mapToBooking(result.rows[0]);
        } catch (error) {
            logger.error(`Error creating booking for room ${roomId}:`, error);
            throw new Error('Failed to create booking');
        }
    }

    /**
     * Get all bookings
     * @returns Promise<Booking[]> Array of all bookings
     */
    public async getAllBookings(): Promise<Booking[]> {
        try {
            const result = await this.db.query('SELECT * FROM bookings ORDER BY booking_time DESC');
            return result.rows.map(this.mapToBooking);
        } catch (error) {
            logger.error('Error fetching all bookings:', error);
            throw new Error('Failed to fetch bookings');
        }
    }

    /**
     * Delete all bookings (used during reset)
     * @returns Promise<number> Number of bookings deleted
     */
    public async deleteAllBookings(): Promise<number> {
        try {
            const result = await this.db.query('TRUNCATE bookings RESTART IDENTITY');
            return result.rowCount ?? 0;
        } catch (error) {
            logger.error('Error deleting all bookings:', error);
            throw new Error('Failed to delete bookings');
        }
    }

    /**
     * Create multiple bookings in a transaction and update room status
     * @param roomIds Array of room IDs to book
     * @returns Promise<Booking[]> Array of created bookings
     */
    public async createBookingsTransaction(roomIds: number[]): Promise<Booking[]> {
        const bookings: Booking[] = [];

        // Create bookings and update room status
        for (const roomId of roomIds) {
            // Update room status to booked
            await this.db.query('UPDATE rooms SET is_booked = TRUE WHERE id = $1', [roomId]);

            // Create booking record
            const bookingResult = await this.db.query(
                'INSERT INTO bookings (room_id) VALUES ($1) RETURNING *',
                [roomId]
            );

            bookings.push(this.mapToBooking(bookingResult.rows[0]));
        }

        return bookings;

    }

    /**
     * Maps a database row to a Booking object
     * @param row Database row
     * @returns Booking object
     */
    private mapToBooking(row: any): Booking {
        return {
            id: row.id,
            roomId: row.room_id,
            bookingTime: row.booking_time,
            username: row.username
        };
    }
}
