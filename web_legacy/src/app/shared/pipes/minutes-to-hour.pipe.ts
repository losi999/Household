import { Pipe, PipeTransform } from '@angular/core';
import { numberToGivenDigits } from '@household/shared/common/utils';

@Pipe({
  name: 'minutesToHour',
})
export class MinutesToHourPipe implements PipeTransform {

  transform(totalMinutes: number): unknown {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${numberToGivenDigits(minutes, 2)}`;
  }

}
