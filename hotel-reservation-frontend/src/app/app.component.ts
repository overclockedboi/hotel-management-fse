import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingTableComponent } from './booking-table/booking-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotel-reservation';
}
