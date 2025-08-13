import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRange',
  standalone: false,
})
export class TimeRangePipe implements PipeTransform {

  transform(isFullDayVisible: boolean): string[] {

    return Array.from({
      length: 24,
    }).flatMap((_, i) => {
      const hour = i.toString().padStart(2, '0');
      return [
        `${hour}:00`,
        `${hour}:30`,
      ];
    });
    
  }

}
