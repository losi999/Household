import { Pipe, PipeTransform } from '@angular/core';
import { CalendarWeek } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';

@Pipe({
  name: 'calendarGridRows',
  standalone: false,
})
export class CalendarGridRowsPipe implements PipeTransform {

  transform({ start, end }: CalendarWeek): string {
    const rowsToHideStart = Math.floor((start) / 2) * 2;
    const rowsToHideEnd = 96 - Math.floor((end + 1) / 2) * 2;

    const parts = [
      rowsToHideStart > 0 ? `repeat(${rowsToHideStart}, auto)` : '',
      `repeat(${96 - rowsToHideStart - rowsToHideEnd}, 20px)`,
      rowsToHideEnd > 0 ? `repeat(${rowsToHideEnd}, auto)` : '',
    ];

    return parts.join(' ');
  }

}
