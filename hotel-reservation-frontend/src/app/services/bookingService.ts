import { environment } from "../../environments/enviroment";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface Room {
    id: number;
    number: string;
    type: string;
    price: number;
    floor: number;
    isAvailable: boolean;
    isBooked: boolean;
}

export interface Booking {
    id: number;
    roomId: number;
    checkIn: Date;
    checkOut: Date;
    guestName: string;
}

export interface CreateBookingDto {
    numberOfRooms: number;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `Backend returned code ${error.status}, body was: ${error.error}`;
        }
        return throwError(() => new Error(errorMessage));
    }

    getRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(`${this.apiUrl}/api/rooms`)
            .pipe(catchError(this.handleError));
    }

    getBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/api/bookings`)
            .pipe(catchError(this.handleError));
    }

    createBooking(booking: CreateBookingDto): Observable<Booking> {
        return this.http.post<Booking>(`${this.apiUrl}/api/bookings`, booking)
            .pipe(catchError(this.handleError));
    }

    updateBooking(id: number, booking: Partial<CreateBookingDto>): Observable<Booking> {
        return this.http.patch<Booking>(`${this.apiUrl}/api/bookings/${id}`, booking)
            .pipe(catchError(this.handleError));
    }

    reset(): Observable<ArrayBuffer> {
        return this.http.post<ArrayBuffer>(`${this.apiUrl}/api/reset`, null)
            .pipe(catchError(this.handleError));
    }
    random(): Observable<ArrayBuffer> {
        return this.http.post<ArrayBuffer>(`${this.apiUrl}/api/randomize`, null)
            .pipe(catchError(this.handleError));
    }
}
