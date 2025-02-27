import { Room, BookingResponse, Booking } from '../util/types';
import { RoomModel } from '../models/room';
import { BookingModel } from '../models/booking';
import logger from '../util/logger';

/**
 * Room Service - Business logic for rooms and bookings
 */
export class RoomService {
    constructor(private roomModel: RoomModel, private bookingModel: BookingModel) { }
    /**
     * Get all rooms
     * @returns Promise<Room[]> Array of all rooms
     */
    public async getAllRooms(): Promise<Room[]> {
        return this.roomModel.getAllRooms();
    }

    /**
     * Get all bookings
     * @returns Promise<Booking[]> Array of all bookings
     */
    public async getAllBookings(): Promise<Booking[]> {
        return this.bookingModel.getAllBookings();
    }

    /**
     * Reset all bookings - marks all rooms as available and deletes booking records
     * @returns Promise<{ roomsReset: number, bookingsDeleted: number }> Count of reset items
     */
    public async resetAllBookings(): Promise<{ roomsReset: number, bookingsDeleted: number }> {
        const roomsReset = await this.roomModel.resetAllBookings();
        const bookingsDeleted = await this.bookingModel.deleteAllBookings();

        return { roomsReset, bookingsDeleted };
    }

    /**
     * Create random bookings for a percentage of rooms
     * @returns Promise<{ bookedRooms: number }> Count of randomly booked rooms
     */
    public async createRandomBookings(): Promise<{ bookedRooms: number }> {
        try {

            /**
             * ! logic explainations:
             * - reset all bookings
             * - get all rooms
             * - calculate number of rooms to book (random)
             * - shuffle rooms
             * - select rooms to book (random)
             * - create bookings transaction
             * - return booked rooms
             */
            await this.resetAllBookings();
            const allRooms = await this.roomModel.getAllRooms();
            const roomsToBook = Math.floor(allRooms.length * Math.random());
            logger.debug(`Randomly booking ${roomsToBook} out of ${allRooms.length} rooms`);
            const shuffledRooms = this.shuffleArray([...allRooms]);
            const selectedRoomIds = shuffledRooms.slice(0, roomsToBook).map(room => room.id);
            await this.bookingModel.createBookingsTransaction(selectedRoomIds);

            return { bookedRooms: roomsToBook };
        } catch (error) {
            logger.error('Error creating random bookings:', error);
            throw new Error('Failed to create random bookings');
        }
    }

    /**
         * Helper method to shuffle an array using Fisher-Yates algorithm
         * @param array Array to shuffle
         * @returns Shuffled array
         */
    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
   * Find and book optimal rooms for a group
   * @param numberOfRooms Number of rooms to book
   * @returns Promise<BookingResponse> Booked rooms and total travel time
   */
    public async findAndBookOptimalRooms(numberOfRooms: number): Promise<BookingResponse> {
        try {
            if (numberOfRooms < 1 || numberOfRooms > 5) {
                throw new Error('Number of rooms must be between 1 and 5');
            }

            const availableRooms = await this.roomModel.getAvailableToBookRooms();
            if (availableRooms.length < numberOfRooms) {
                throw new Error(`Not enough rooms available. Only ${availableRooms.length} rooms are available.`);
            }

            const optimalRooms = this.findOptimalRooms(availableRooms, numberOfRooms);
            await this.bookingModel.createBookingsTransaction(optimalRooms.map(room => room.id));

            const totalTravelTime = this.calculateTotalTravelTime(optimalRooms);

            return { rooms: optimalRooms, totalTravelTime };
        } catch (error) {
            logger.error('Error finding and booking optimal rooms:', error);
            throw error;
        }
    }

    /**
     * Find optimal rooms to minimize travel time between first and last room
     * @param availableRooms Array of available rooms
     * @param numberOfRooms Number of rooms needed
     * @returns Room[] Array of optimal rooms
     */
    private findOptimalRooms(availableRooms: Room[], numberOfRooms: number): Room[] {
        if (availableRooms.length < numberOfRooms) return [];

        for (let i = 0; i <= availableRooms.length - numberOfRooms; i++) {
            const candidate = availableRooms.slice(i, i + numberOfRooms);
            if (candidate.every(room => room.floor === candidate[0].floor)) {
                return candidate;
            }
        }
        let bestRooms: Room[] = [];
        let minTravelTime = Infinity;

        for (let start = 0; start <= availableRooms.length - numberOfRooms; start++) {
            const candidateRooms = availableRooms.slice(start, start + numberOfRooms);
            const travelTime = this.calculateTotalTravelTime(candidateRooms);
            if (travelTime < minTravelTime) {
                minTravelTime = travelTime;
                bestRooms = candidateRooms;
            }
        }

        return bestRooms;
    }

    /**
     * Extract position from room number (last two digits)
     * @param roomNumber Room number string (e.g., "101", "1001")
     * @returns Number representing position (1-10 or 1-7)
     */
    private getRoomPosition(roomNumber: string): number {
        const roomSuffix = parseInt(roomNumber.slice(-2));
        return roomSuffix;
    }

    /**
     * Calculate travel time between the first and last room in a sequence
     * @param rooms Array of rooms
     * @returns Total travel time in minutes
     */
    private calculateTotalTravelTime(rooms: Room[]): number {
        if (rooms.length <= 1) return 0;

        const firstRoom = rooms[0];
        const lastRoom = rooms[rooms.length - 1];

        const pos1 = this.getRoomPosition(firstRoom.roomNumber);
        const pos2 = this.getRoomPosition(lastRoom.roomNumber);

        if (firstRoom.floor === lastRoom.floor) {
            return Math.abs(pos2 - pos1); // 1 minute per room
        } else {
            const verticalTime = Math.abs(lastRoom.floor - firstRoom.floor) * 2; // 2 minutes per floor
            return verticalTime + pos1 + pos2;
        }
    }


}
