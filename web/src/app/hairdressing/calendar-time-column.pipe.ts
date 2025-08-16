import { Pipe, PipeTransform } from '@angular/core';
import { numberToGivenDigits } from '@household/shared/common/utils';
import { CalendarWeek } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';

@Pipe({
  name: 'calendarTimeColumn',
  standalone: false,
})
export class CalendarTimeColumnPipe implements PipeTransform {

  transform({ start, end }: CalendarWeek): unknown {
    return Array.from(
      {
        length: 96,
      },
      (_, i) => {
        if (i % 2 === 0 && i + 2 >= start && i <= end) {
        
          return `${numberToGivenDigits(Math.floor(i / 4), 2)}:${i % 4 === 0 ? '00' : '30'}`;
        }

      },
    );
  }

}
