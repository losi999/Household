import { Component, inject, input } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

@Component({
  selector: 'hairdressing-calendar-horizontal-day',
  imports: [],
  templateUrl: './calendar-horizontal-day.html',
  styleUrl: './calendar-horizontal-day.scss',
})
export class CalendarHorizontalDay {
  private store = inject(Store);

  pendingStart = input.required<number>();
  pendingEnd = input.required<number>();
  date = input.required<Date>();
  pendingCalendarEntryId = input.required<Calendar.Entry.Id>();
}
