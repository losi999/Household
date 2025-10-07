import { Pipe, PipeTransform } from '@angular/core';
import { Calendar } from '@household/shared/types/types';

@Pipe({
  name: 'pastEntries',
  standalone: false,
})
export class PastEntriesPipe implements PipeTransform {
  transform(entries: Calendar.Entry.ResponseBase[]): unknown {
    const now = new Date().toISOString();
    return entries.filter(e => {
      return e.day < now;
    });
  }
}
