import { Pipe, PipeTransform } from '@angular/core';
import { Calendar } from '@household/shared/types/types';

@Pipe({
  name: 'upcomingEntries',
  standalone: false,
})
export class UpcomingEntriesPipe implements PipeTransform {
  transform(entries: Calendar.Entry.ResponseBase[]): unknown {
    const now = new Date().toISOString();
    return entries.filter(e => {
      return e.day > now;
    }).toReversed();
  }

}
