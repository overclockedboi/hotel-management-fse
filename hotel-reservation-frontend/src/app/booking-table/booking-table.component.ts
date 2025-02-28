import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-table.component.html',
  styleUrl: './booking-table.component.scss'
})
export class BookingTableComponent {
  @Input() rooms: any[] = []
  floors = this.rooms.map(room => room.floor).filter((value, index, self) => self.indexOf(value) === index).reverse()

  getRoomAt(floor: any, col: number): any {

    return this.rooms.find(room => room.floor === floor && room.id % 10 === col)

  }
}
