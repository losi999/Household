import { Pipe, PipeTransform } from '@angular/core';
import { dateToISOTimeString, timeSlotToDate } from '@household/shared/common/utils';

@Pipe({
  name: 'timeSlotToDate',
  standalone: false,
})
export class TimeSlotToDatePipe implements PipeTransform {

  transform(timeSlot: number): string {
    return dateToISOTimeString(timeSlotToDate(timeSlot));
  }

}
