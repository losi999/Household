import { Pipe, PipeTransform } from '@angular/core';
import { timeSlotToTimeString } from '@household/shared/common/utils';

@Pipe({
  name: 'timeSlotToTime',
  standalone: false,
})
export class TimeSlotToTimePipe implements PipeTransform {

  transform(timeSlot: number): string {
    return timeSlotToTimeString(timeSlot);
  }

}
