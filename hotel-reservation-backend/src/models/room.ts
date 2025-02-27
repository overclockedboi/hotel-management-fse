import { Room } from '../util/types';
import { IDatabase } from '../services/database';
import logger from '../util/logger';

/**
 * Room Model - Handles database operations for rooms
 */
export class RoomModel {
    pool = null;
    constructor(private db: IDatabase) {


    }
    /**
     * Get all rooms from the database
     * @returns Promise<Room[]> Array of all rooms
     */
    public async getAllRooms(): Promise<Room[]> {
        try {
            const result = await this.db.query('SELECT * FROM rooms ORDER BY floor, room_number');
            return result.rows.map(this.mapToRoom);
        } catch (error) {
            logger.error('Error fetching all rooms:', error);
            throw new Error('Failed to fetch rooms');
        }
    }

    /**
     * Get available (not booked) rooms
     * @returns Promise<Room[]> Array of available rooms
     */
    public async getAvailableToBookRooms(): Promise<Room[]> {
        try {
            const result = await this.db.query('SELECT * FROM rooms WHERE is_booked = FALSE ORDER BY floor, room_number');
            return result.rows.map(this.mapToRoom);
        } catch (error) {
            logger.error('Error fetching available rooms:', error);
            throw new Error('Failed to fetch available rooms');
        }
    }

    /**
     * Get rooms by ID array
     * @param ids Array of room IDs to retrieve
     * @returns Promise<Room[]> Array of rooms matching the IDs
     */
    public async getRoomsByIds(ids: number[]): Promise<Room[]> {
        try {
            if (ids.length === 0) return [];

            const result = await this.db.query(
                'SELECT * FROM rooms WHERE id = ANY($1) ORDER BY floor, room_number',
                [ids]
            );
            return result.rows.map(this.mapToRoom);
        } catch (error) {
            logger.error('Error fetching rooms by IDs:', error);
            throw new Error('Failed to fetch rooms by IDs');
        }
    }

    /**
     * Update a room's booking status
     * @param roomId Room ID to update
     * @param isBooked New booking status
     * @returns Promise<Room> Updated room
     */
    public async updateBookingStatus(roomId: number, isBooked: boolean): Promise<Room> {
        try {
            const result = await this.db.query(
                'UPDATE rooms SET is_booked = $1 WHERE id = $2 RETURNING *',
                [isBooked, roomId]
            );

            if (result.rows.length === 0) {
                throw new Error(`Room with ID ${roomId} not found`);
            }

            return this.mapToRoom(result.rows[0]);
        } catch (error) {
            logger.error(`Error updating room ${roomId} booking status:`, error);
            throw new Error('Failed to update room booking status');
        }
    }

    /**
     * Reset all rooms to not booked
     * @returns Promise<number> Number of rooms updated
     */
    public async resetAllBookings(): Promise<number> {
        try {
            const result = await this.db.query('UPDATE rooms SET is_booked = FALSE');
            return result.rowCount ?? 0;
        } catch (error) {
            logger.error('Error resetting all room bookings:', error);
            throw new Error('Failed to reset room bookings');
        }
    }

    /**
     * Maps a database row to a Room object
     * @param row Database row
     * @returns Room object
     */
    private mapToRoom(row: any): Room {
        return {
            id: row.id,
            roomNumber: row.room_number,
            floor: row.floor,
            isBooked: row.is_booked,
            isAvailable: row.isavailable
        };
    }
}
