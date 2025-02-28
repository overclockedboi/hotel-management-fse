
export class BookingService {

    async getRooms() {
        const response = await fetch('https://cuddly-waddle-vq9pjxppxg6fq4j-3000.app.github.dev/api/rooms');
        return await response.json();
    }

    async getBookings() {
        const response = await fetch('https://cuddly-waddle-vq9pjxppxg6fq4j-3000.app.github.dev/api/bookings');
        return await response.json();
    }
}