import { Component, OnInit } from '@angular/core';
import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectCalendarWeek } from '@household/web/state/calendar/calendar.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';

export type CalendarWeek = {
  start: number;
  end: number;
  days: Calendar.Day.Response[];
};

@Component({
  selector: 'household-hairdressing-calendar-home',
  standalone: false,
  templateUrl: './hairdressing-calendar-home.component.html',
  styleUrl: './hairdressing-calendar-home.component.scss',
})
export class HairdressingCalendarHomeComponent implements OnInit {
  week: Observable<CalendarWeek>;
  private weekStart: Date;

  constructor(private store: Store) {}

  private loadWeek(date: Date) {
    const weekday = date.getDay();
    const diffToMonday = (weekday === 0 ? 6 : weekday - 1);
    
    this.weekStart = addDays(-diffToMonday, date);
    const weekEnd = addDays(-diffToMonday + 6, date);

    this.week = this.store.select(selectCalendarWeek(date));

    this.store.dispatch(calendarApiActions.listCalendarDaysInitiated({
      dateFrom: dateToISODateString(this.weekStart),
      dateTo: dateToISODateString(weekEnd),
    }));     
  }

  ngOnInit(): void {
    this.loadWeek(new Date());
  }

  onChangeWeek(diff: number) {
    const date = addDays(diff * 7, new Date(this.weekStart));
    this.loadWeek(date);
  }

  onShowToday() {
    this.loadWeek(new Date());
  }

  onCreateWork() {
    this.store.dispatch(dialogActions.createCalendarEntry({
      entryType: CalendarEntryType.Work,
    }));
  }

  onSetVacationDay(day: string) {
    this.store.dispatch(dialogActions.setVacationDay({
      day,
    }));
  }

  onSetWorkDay(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    this.store.dispatch(dialogActions.setWorkDay(day));
  }

  onCreatePersonal() {
    this.store.dispatch(dialogActions.createCalendarEntry({
      entryType: CalendarEntryType.Personal,
    }));
  }

  onCreateIssue() {
    this.store.dispatch(dialogActions.createCalendarEntry({
      entryType: CalendarEntryType.Issue,
    }));
  }
}
