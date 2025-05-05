import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';

@Pipe({
  name: 'daysOfMonth',
})
export class DaysOfMonthPipe implements PipeTransform {
  transform(value: Moment): Date[] {
    return Array.from({
      length: value.daysInMonth(),
    }, (_, index) => {
      const date = value.toDate();
      date.setDate(index + 1);
      return date;
    });
  }

}
