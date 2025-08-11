import { Pipe, PipeTransform } from '@angular/core';
import { Entry } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';

@Pipe({
  name: 'timespan',
  standalone: false,
})
export class TimespanPipe implements PipeTransform {

  transform({ start, end }: Entry): string {
    return `${start + 1} / ${end + 1}`;
  }

}
