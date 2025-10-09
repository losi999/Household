import { Pipe, PipeTransform } from '@angular/core';
import { addDays } from '@household/shared/common/utils';

@Pipe({
  name: 'daysOfWeek',
  standalone: false,
})
export class DaysOfWeekPipe implements PipeTransform {

  transform(weekStart: Date): Date[] {
    return Array.from({
      length: 7,
    }, (_, index) => {
      return addDays(index, weekStart);
    });
  }

}
