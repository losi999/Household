import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesToHour',
})
export class MinutesToHourPipe implements PipeTransform {

  transform(totalMinutes: number): unknown {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

}
