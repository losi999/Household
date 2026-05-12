import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LimitedCalendarDay } from '@hairdressing/types';

@Component({
  selector: 'hairdressing-calendar-horizontal-day',
  imports: [
    NgClass,
    MatFormFieldModule,
  ],
  templateUrl: './calendar-horizontal-day.html',
  styleUrl: './calendar-horizontal-day.scss',
})
export class CalendarHorizontalDay {
  pendingStart = input.required<number>();
  pendingEnd = input.required<number>();
  calendarDay = input.required<LimitedCalendarDay>();
}
