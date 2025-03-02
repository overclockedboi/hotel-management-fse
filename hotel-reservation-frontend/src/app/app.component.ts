import { Component, OnChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingTableComponent } from './booking-table/booking-table.component';
import { Room, BookingService } from './services/bookingService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingTableComponent, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotel-reservation';
  available: number = 0;
  booked: number = 0;
  tobeBooked: number = 0;
  change: boolean = true;
  rooms: Room[] = [];
  booking: any[] = [];
  loading: boolean = true;
  constructor(private bookingService: BookingService) { }



  setBooked(event: any) {
    if (event >= 0 && event < 6 && this.available >= event) {

      this.tobeBooked = event;
    }
  }

  bookRoom() {
    this.loading = false;
    this.bookingService.createBooking({ numberOfRooms: this.tobeBooked }).subscribe({
      next: (booking: any) => {
        this.booking.push(booking)
        this.tobeBooked = 0;
        this.refresh();
        this.loading = true;
      },
      error: (error: any) => {
        console.log(error)
      }
    })

  }
  refresh() {
    this.bookingService.getRooms().subscribe({
      next: (rooms: any) => {
        this.rooms = rooms['data']
        this.available = this.rooms.length - this.rooms.filter((room: Room) => room.isBooked).length;
        this.booked = this.rooms.filter(room => room.isBooked).length;
        this.loading = false;
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

  reset() {
    this.loading = true;
    this.bookingService.reset().subscribe({
      next: () => {

        this.refresh()
        this.loading = false;
      },
      error: (error: any) => {
        console.log(error)
      }
    })
  }
  random() {
    this.loading = false;
    this.bookingService.random().subscribe({
      next: () => {
        this.loading = true;
        this.refresh()
      },
      error: (error: any) => {
        console.log(error)
      }
    })
  }
  ngOnInit() {
    this.refresh()
  }

}
