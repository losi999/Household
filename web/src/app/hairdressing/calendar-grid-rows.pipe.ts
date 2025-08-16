import { Pipe, PipeTransform } from '@angular/core';
import { CalendarWeek } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';

@Pipe({
  name: 'calendarGridRows',
  standalone: false,
})
export class CalendarGridRowsPipe implements PipeTransform {

  transform({ start, end }: CalendarWeek): string {
    const rowsToHideStart = Math.floor((start - 1) / 2) * 2;
    const rowsToHideEnd = 96 - Math.floor((end) / 2) * 2;
      
    return `repeat(${rowsToHideStart}, auto) repeat(${96 - rowsToHideStart - rowsToHideEnd}, 20px) repeat(${rowsToHideEnd}, auto)`;
  }

}
