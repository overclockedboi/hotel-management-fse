export interface Room {
    id: number;
    roomNumber: string;
    floor: number;
    isBooked: boolean;
    isAvailable: boolean;
}

export interface Booking {
    id: number;
    roomId: number;
    bookingTime: Date;
    username: string;
}

export interface BookingRequest {
    numberOfRooms: number;
}

export interface BookingResponse {
    rooms: Room[];
    totalTravelTime: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export interface AppConfig {
    port: number;
    env: string;
    database: DatabaseConfig;
}