import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Room } from '../services/bookingService';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-table.component.html',
  styleUrl: './booking-table.component.scss'
})
export class BookingTableComponent {

  @Input() rooms: Room[] = [];
  constructor() { }

  get floors() {
    return this.rooms.map((room: Room) => room.floor)
      .filter((value, index, self) => self.indexOf(value) === index)

  }

  getRoomAt(floor: any, col: number): any {

    return this.rooms.find((room: Room) => room.floor === floor && room.id % 10 === col)

  }
}
