import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { TrackByService } from '@household/web/services/track-by.service';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';
import { selectCalendarWeek } from '@household/web/state/calendar/calendar.selector';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { selectCustomerJobByIdAndName } from '@household/web/state/customer/customer.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { CustomerJob } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { mergeMap, Observable, of } from 'rxjs';

export type CalendarWeek = {
  start: number;
  end: number;
  days: Calendar.Day.Response[];
};

@Component({
  selector: 'household-calendar-home',
  standalone: false,  
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.scss',
})
export class CalendarHomeComponent implements OnInit {
  week: Observable<CalendarWeek>;
  weekStart: Date;

  pendingCustomerJob: Observable<CustomerJob>;

  constructor(private store: Store, public trackBy: TrackByService, private activatedRoute: ActivatedRoute) {}

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
    console.log('init');
    this.loadWeek(new Date());
    this.store.dispatch(customerApiActions.listCustomersInitiated());

    this.pendingCustomerJob = this.activatedRoute.queryParams.pipe(mergeMap((value) => {
      const customerId = value.customerId as Customer.Id;
      const jobName = value.jobName;

      if (customerId && jobName) {
        return this.store.select(selectCustomerJobByIdAndName(customerId, jobName)).pipe(
          takeFirstDefined());
      }
      return of(undefined);
    }));
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
