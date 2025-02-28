import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingTableComponent } from './booking-table/booking-table.component';
import { BookingService } from './services/bookingService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotel-reservation';
  rooms = []

  ngOnInit() {
    new BookingService().getRooms().then(rooms => this.rooms = rooms)
  }
}
