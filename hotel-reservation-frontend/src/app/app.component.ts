import { Component, OnChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingTableComponent } from './booking-table/booking-table.component';
import { Room, BookingService } from './services/bookingService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingTableComponent, RouterOutlet],
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
  constructor(private bookingService: BookingService) { }



  setBooked(event: any) {
    if (event >= 0 && event < 6) {

      this.tobeBooked = event;
    }
  }

  bookRoom() {
    this.bookingService.createBooking({ numberOfRooms: this.tobeBooked }).subscribe({
      next: (booking: any) => {
        this.booking.push(booking)
        this.tobeBooked = 0;
        this.refresh()
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
    this.bookingService.reset().subscribe({
      next: () => {

        this.refresh()
      },
      error: (error: any) => {
        console.log(error)
      }
    })
  }
  random() {
    this.bookingService.random().subscribe({
      next: () => {

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
