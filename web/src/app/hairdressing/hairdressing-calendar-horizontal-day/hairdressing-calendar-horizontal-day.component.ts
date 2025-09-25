import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { dateToISODateString } from '@household/shared/common/utils';
import { Calendar } from '@household/shared/types/types';
import { selectCalendarDay } from '@household/web/state/calendar/calendar.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-hairdressing-calendar-horizontal-day',
  standalone: false,
  templateUrl: './hairdressing-calendar-horizontal-day.component.html',
  styleUrl: './hairdressing-calendar-horizontal-day.component.scss',
})
export class HairdressingCalendarHorizontalDayComponent implements OnChanges {
  @Input() excludedCalendarEntryId: Calendar.Entry.Id;
  @Input() date: Date;
  @Input() timeRange: {
    start: number;
    end: number;
  };

  constructor(private store: Store) { }

  calendarDay: Observable<Calendar.Day.Response>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.date) {
      this.calendarDay = this.store.select(selectCalendarDay(dateToISODateString(this.date)));
    }
  }
}
