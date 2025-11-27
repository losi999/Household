import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { TrackByService } from '@household/web/services/track-by.service';
import { calendarActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { selectCalendarWeek } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerJobByIdAndName } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { CustomerJob } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { mergeMap, Observable, of } from 'rxjs';
import { navigationActions } from '@household/web/state/navigation/navigation.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';
import { DaysOfWeekPipe } from '@household/web/app/hairdressing/calendar/pipes/days-of-week.pipe';
import { CalendarTimeColumnPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-time-column.pipe';
import { CalendarGridRowsPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-grid-rows.pipe';
import { CalendarVerticalDayComponent } from '@household/web/app/hairdressing/calendar/calendar-vertical-day/calendar-vertical-day.component';

export type CalendarWeek = {
  start: number;
  end: number;
  days: {
    [date: string]: Calendar.Day.Response;
  };
};

@Component({
  selector: 'household-calendar-home',
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    AsyncPipe,
    TimeSlotToTimePipe,
    DaysOfWeekPipe,
    RouterLink,
    DatePipe,
    CalendarTimeColumnPipe,
    CalendarGridRowsPipe,
    KeyValuePipe,
    CalendarVerticalDayComponent,
  ],  
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.scss',
})
export class CalendarHomeComponent implements OnInit {
  week: Observable<CalendarWeek>;
  weekStart: Date;

  pendingCustomerJob: Observable<CustomerJob>;

  constructor(private store: Store, public trackBy: TrackByService, private activatedRoute: ActivatedRoute) {}

  private currentWeekStart: Date;

  private loadWeek() {
    this.week = this.store.select(selectCalendarWeek(this.weekStart));

    this.store.dispatch(calendarActions.listCalendarWeek({
      weekStart: this.weekStart,
    }));  
  }

  ngOnInit(): void {
    const now = new Date();
    const weekday = now.getDay();
    const diffToMonday = (weekday === 0 ? 6 : weekday - 1);
    
    this.currentWeekStart = addDays(-diffToMonday, now);
    
    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(priceApiActions.listPricesInitiated());

    this.activatedRoute.queryParams.subscribe((value) => {
      if (value.weekStart) {
        this.weekStart = new Date(value.weekStart);
      } else {
        this.weekStart = this.currentWeekStart;
      }

      this.loadWeek();
    });

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
    this.store.dispatch(navigationActions.changeCalendarWeek({
      weekStart: dateToISODateString(addDays(diff * 7, this.weekStart)), 
    }));
  }

  onShowToday() {
    this.store.dispatch(navigationActions.changeCalendarWeek({}));
  }

  onCreateWork() {
    this.store.dispatch(calendarActions.createCalendarEntry({
      entryType: CalendarEntryType.Work,
    }));
  }

  onSetWorkDay(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    this.store.dispatch(calendarActions.setWorkDay(day));
  }

  onCreatePersonal() {
    this.store.dispatch(calendarActions.createCalendarEntry({
      entryType: CalendarEntryType.Personal,
    }));
  }

  onCreateIssue() {
    this.store.dispatch(calendarActions.createCalendarEntry({
      entryType: CalendarEntryType.Issue,
    }));
  }

}
