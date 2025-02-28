import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookingService, Room } from '../services/bookingService';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [CommonModule, BookingTableComponent, HttpClientModule, CommonModule],
  templateUrl: './booking-table.component.html',
  styleUrl: './booking-table.component.scss'
})
export class BookingTableComponent {
  rooms: any[] = [];
  booking: any[] = [];

  constructor(private bookingService: BookingService) { }

  get floors() {
    return this.rooms.map(room => room.floor)
      .filter((value, index, self) => self.indexOf(value) === index)
      .reverse();
  }
  ngOnInit() {
    this.bookingService.getRooms().subscribe({
      next: (rooms: any) => {
        this.rooms = rooms['data']
      },
      error: (error: any) => {
        console.log(error)
      }
    });
    this.bookingService.getBookings().subscribe({
      next: (bookings: any) => {
        this.booking = bookings['data']
      }
    })
  }
  getRoomAt(floor: any, col: number): any {

    return this.rooms.find(room => room.floor === floor && room.id % 10 === col)

  }
}
