import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
import { selectCalendarDay } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-calendar-horizontal-day',
  standalone: false,
  templateUrl: './calendar-horizontal-day.component.html',
  styleUrl: './calendar-horizontal-day.component.scss',
})
export class CalendarHorizontalDayComponent implements OnChanges {
  @Input() pendingCalendarEntryId: Calendar.Entry.Id;
  @Input() date: Date;
  @Input() pendingStart: number;
  @Input() pendingEnd: number;

  constructor(private store: Store) { }

  calendarDay: Observable<Calendar.Day.Response>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.date) {
      this.calendarDay = this.store.select(selectCalendarDay(this.date));
    }
  }
}
