import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { customerApiActions } from '@hairdressing/state/customer/customer-actions';
import { priceApiActions } from '@hairdressing/state/price/price-actions';
import { navigationActions } from '@household/shared-ui';
import { timeSlotToTimeString } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { calendarActions } from '@hairdressing/state/calendar/calendar-actions';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { Calendar } from '@household/shared/types/types';
import { selectCalendarWeek } from '@hairdressing/state/calendar/calendar-selector';
import { getISOWeek, lastDayOfISOWeekYear } from 'date-fns';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { selectPendingCustomerJob } from '@hairdressing/state/customer/customer-selector';
import { CalendarVerticalDay } from '../calendar-vertical-day/calendar-vertical-day';

@Component({
  selector: 'hairdressing-calendar-home',
  imports: [
    Toolbar,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    DatePipe,
    KeyValuePipe,
    TimeSlotToTimePipe,
    RouterModule,
    CalendarVerticalDay,
  ],
  templateUrl: './calendar-home.html',
  styleUrl: './calendar-home.scss',
})
export class CalendarHome {
  private store = inject(Store);
  private activatedRoute = inject(ActivatedRoute);

  private queryParams = toSignal<{week: string; year: string; weekOf: string;}>(this.activatedRoute.queryParams);

  private today = new Date();

  private lastISOWeekOfYear = computed(() => {
    console.log('computed last iso week of year', this.year());
    return getISOWeek(lastDayOfISOWeekYear(new Date(this.year(), 0)));
  });

  private week = signal<number>(null);
  private year = signal<number>(null);

  pendingCustomerJob = this.store.selectSignal(selectPendingCustomerJob);
  daysOfWeek = this.store.selectSignal(selectCalendarWeek);

  calendarGridRows = computed(() => {
    const { start, end } = this.daysOfWeek();

    const rowsToHideStart = Math.floor((start) / 2) * 2;
    const rowsToHideEnd = 96 - Math.floor((end + 1) / 2) * 2;

    const parts = [
      rowsToHideStart > 0 ? `repeat(${rowsToHideStart}, auto)` : '',
      `repeat(${96 - rowsToHideStart - rowsToHideEnd}, 20px)`,
      rowsToHideEnd > 0 ? `repeat(${rowsToHideEnd}, auto)` : '',
    ];

    return parts.join(' ');
  });

  calendarTimeColumn = computed(() => {
    const { start, end } = this.daysOfWeek();

    return Array.from(
      {
        length: 96,
      },
      (_, i) => {
        if (i % 2 === 0 && i + 1 >= start && i - 1 <= end) {
          return timeSlotToTimeString(i);
        }

        return undefined;
      },
    );
  });

  constructor() {    
    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(priceApiActions.listPricesInitiated());

    effect(() => {
      if (this.year() && this.week()) {
        this.store.dispatch(calendarActions.listCalendarWeek({
          year: this.year(),
          week: this.week(),
        }));
      }
    });

    effect(() => {
      const weekOf = this.queryParams().weekOf;      
      if (weekOf) {
        const date = new Date(weekOf);
        
        this.year.set(date.getFullYear());
        this.week.set(getISOWeek(date));
      } else { 
        const year = this.queryParams().year;
        const week = this.queryParams().week;

        this.year.set(year ? Number(year) : this.today.getFullYear());
        this.week.set(week ? Number(week) : getISOWeek(this.today));
      }
    });
  }

  onChangeWeek(diff: number) {
    const newWeek = this.week() + diff;
    
    if (newWeek < 1) {
      const newYear = this.year() - 1;
      this.store.dispatch(navigationActions.changeCalendarWeek({
        year: newYear,
        week: getISOWeek(lastDayOfISOWeekYear(new Date(newYear, 0))),
        weekOf: undefined,
      }));
    } else if (newWeek > this.lastISOWeekOfYear()) {
      const newYear = this.year() + 1;
      this.store.dispatch(navigationActions.changeCalendarWeek({
        year: newYear,
        week: 1,
        weekOf: undefined,
      }));
    } else {
      this.store.dispatch(navigationActions.changeCalendarWeek({
        year: this.year() !== this.today.getFullYear() ? this.year() : undefined,
        week: this.week() + diff,
        weekOf: undefined,
      }));

    }

  }

  onShowToday() {
    this.store.dispatch(navigationActions.changeCalendarWeek({
      year: undefined,
      week: undefined,
      weekOf: undefined,
    }));
  }

  onCreateWork() {
    this.store.dispatch(calendarActions.createCalendarEntry({
      entryType: CalendarEntryType.Work,
    }));
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

  onSetWorkDay(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    this.store.dispatch(calendarActions.setWorkDay(day));
  }
}
