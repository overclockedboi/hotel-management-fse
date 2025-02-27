import { Config } from "./config";
import { RoomController } from "./controllers/roomController";
import { BookingModel } from "./models/booking";
import { RoomModel } from "./models/room";
import { Database } from "./services/database";
import { RoomService } from "./services/roomServices";

export class Builder {
    config: Config;
    event: any;
    constructor(config: Config, event: any) {
        this.config = config;
        this.event = event;
    }

    /**
     * Build the classes needed for the application
     */
    async buildApp() {

        const database = Database.initialize({
            host: this.config.host,
            port: this.config.dbPort,
            database: this.config.database,
            user: this.config.user,
            password: this.config.password
        })
        await database.connect()
        const roomModel = new RoomModel(database)
        const bookingModel = new BookingModel(database)
        const roomService = new RoomService(roomModel, bookingModel)
        const roomController = new RoomController(roomService)

        return {
            roomController
        }
    }


}