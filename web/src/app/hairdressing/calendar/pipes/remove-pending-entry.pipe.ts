import { Pipe, PipeTransform } from '@angular/core';
import { calculateWorkdayLimits } from '@household/shared/common/utils';
import { Calendar } from '@household/shared/types/types';
import { LimitedCalendarDay } from '@household/web/types/common';

@Pipe({
  name: 'removePendingEntry',
})
export class RemovePendingEntryPipe implements PipeTransform {

  transform(day: LimitedCalendarDay, pendingCalendarEntryId: Calendar.Entry.Id): LimitedCalendarDay {
    const index = day.entries.findIndex(e => e.calendarEntryId === pendingCalendarEntryId);

    if (index < 0) {
      return day;
    }

    const newDay = {
      ...day,
      entries: day.entries.toSpliced(index, 1),
    };

    const { start, end } = calculateWorkdayLimits(newDay);
    return {
      ...newDay,
      calculatedStart: start,
      calculatedEnd: end,
    };
  }

}
