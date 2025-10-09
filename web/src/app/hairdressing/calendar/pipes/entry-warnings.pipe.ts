import { Pipe, PipeTransform } from '@angular/core';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';

@Pipe({
  name: 'entryWarnings',
  standalone: false,
})
export class EntryWarningsPipe implements PipeTransform 
{

  transform(value: {
    customer: Customer.Response;
    job: Customer.Job.Response;
    title: string;
    description: string;
    day: Date;
    start: number;
    duration: number;
  }, calendarDay: Calendar.Day.Response, entry: Calendar.Entry.Response): unknown {
    const errors = [];
    
    const end = value.start + value.duration;
    if (entry.entryType === CalendarEntryType.Work) { 
      if (value.duration < value.job?.duration) {
        errors.push('Időtartam kevesebb, mint a munkához rögzített');
      }

      switch (calendarDay?.dayType) {
        case CalendarDayType.Vacation: {
          errors.push('Ezt a napot szabadságnak jelölted');
        } break;
        case CalendarDayType.Holiday: {
          errors.push('Munkaszüneti nap');
        } break;
        case CalendarDayType.Weekend: {
          errors.push('Hétvége');
        } break;
        case CalendarDayType.Workday: {
          if (value.start < calendarDay.start || end > calendarDay.end) {
            errors.push('Túlóra');
          }
        } break;
      }
    }

    calendarDay?.entries.filter(e => !(value.start >= e.end || end <= e.start) && e.calendarEntryId !== entry.calendarEntryId).forEach((e) => {
      let entryTypeText: string;
      switch(e.entryType) {
        case CalendarEntryType.Work: {
          entryTypeText = 'munkával';
        } break;
        case CalendarEntryType.Issue: {
          entryTypeText = 'problémával';
        } break;
        case CalendarEntryType.Personal: {
          entryTypeText = 'személyes programmal';
        } break;
      }
      errors.push(`Ütközik az alábbi ${entryTypeText}: ${e.title}`);
    });
    return errors;
  }

}
