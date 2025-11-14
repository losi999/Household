import { Pipe, PipeTransform } from '@angular/core';
import { timeSlotToTimeString } from '@household/shared/common/utils';
import { CalendarWeek } from '@household/web/app/hairdressing/calendar/calendar-home/calendar-home.component';

@Pipe({
  name: 'calendarTimeColumn',
  standalone: false,
})
export class CalendarTimeColumnPipe implements PipeTransform {

  transform({ start, end }: Pick<CalendarWeek, 'end' | 'start' >): string[] {
    return Array.from(
      {
        length: 96,
      },
      (_, i) => {
        if (i % 2 === 0 && i + 1 >= start && i - 1 <= end) {
        
          return timeSlotToTimeString(i);
        }
      },
    );
  }
}
