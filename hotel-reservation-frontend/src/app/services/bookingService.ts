import { environment } from "../../enviroments/enviroment";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class BookingService {
    constructor(private http: HttpClient) { }

    async getRooms() {
        const response = this.http.get(`${environment.apiUrl}/rooms`).subscribe(
            (data) => {
                return data;
            }
        );
        return response
    }

    async getBookings() {
        const response =this.http.get(`${environment.apiUrl}/api/bookings`);
        return response;
    }
}