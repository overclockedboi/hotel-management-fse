import { Router } from 'express';
import { RoomController } from './controllers/roomController';

export class Routes {
    constructor(private roomController: RoomController) { }
    public load(): Router {
        const router = Router();


        //  get all rooms
        router.get('/rooms', this.roomController.getAllRooms);
        // book rooms with number of rooms
        router.post('/bookings', this.roomController.bookRooms);
        // get all bookings
        router.get('/bookings', this.roomController.getAllBookings);
        // reset all bookings
        router.post('/reset', this.roomController.resetBookings);
        // randomize bookings
        router.post('/randomize', this.roomController.randomizeBookings);

        return router;
    }
}

export default Routes;