import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { navigationEvents } from '@household/shared-ui';
import { addDays, dateToISODateString, timeSlotToTimeString } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { Calendar, Customer } from '@household/shared/types/types';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { CalendarVerticalDay } from '../calendar-vertical-day/calendar-vertical-day';
import { injectDispatch } from '@ngrx/signals/events';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { CalendarWeek, CustomerJob } from '@hairdressing/types';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarStore } from '@hairdressing/state/calendar/calendar-store';
import { WORKDAY_START, WORKDAY_END } from '@household/shared/constants';
import { lastDayOfISOWeekYear, startOfISOWeek, setISOWeek, getISOWeek } from 'date-fns';

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
  private priceApiEvents = injectDispatch(priceApiEvents);
  private customerApiEvents = injectDispatch(customerApiEvents);
  private calendarEvents = injectDispatch(calendarEvents);
  private navigationEvents = injectDispatch(navigationEvents);
  private customerStore = inject(CustomerStore);
  readonly calendarStore = inject(CalendarStore);
  
  private activatedRoute = inject(ActivatedRoute);

  private queryParams = toSignal<{
    week: string; 
    year: string;
    weekOf: string;
    customerId: Customer.Id;
    jobName: string;
  }>(this.activatedRoute.queryParams);

  private today = new Date();

  private lastISOWeekOfYear = computed(() => {
    console.log('computed last iso week of year', this.year());
    return getISOWeek(lastDayOfISOWeekYear(new Date(this.year(), 0)));
  });

  private week = signal<number>(null);
  private year = signal<number>(null);

  pendingCustomerJob = computed<CustomerJob>(() => {
    const customer = this.customerStore.customerList().find(c => c.customerId === this.queryParams().customerId);
    const job = customer?.jobs.find(j => j.name === this.queryParams().jobName);
    if (!customer || !job) {
      return undefined;
    }
    return {
      customer,
      ...job,
    };
  });
  daysOfWeek = computed<CalendarWeek>(() => {
    const weekOf = this.queryParams().weekOf ? new Date(this.queryParams().weekOf) : new Date();
    const year = Number(this.queryParams().year) || weekOf.getFullYear();
    const week = Number(this.queryParams().week) || getISOWeek(weekOf);
    
    const weekStart = startOfISOWeek(setISOWeek(new Date(year, 0), week));

    return Array.from({
      length: 7, 
    }, (_, i) => i).reduce<CalendarWeek>((accumulator, _, index) => {
      const d = dateToISODateString(addDays(index, weekStart));
      const day = this.calendarStore.days()[d];
    
      if (day) {
        let min = accumulator.start;
        let max = accumulator.end;
        day.entries.forEach((e) => {
          if (e.start < min) {
            min = e.start;
          }
          if (e.end > max) {
            max = e.end;
          }
        });
      
        return {
          start: min,
          end: max,
          days: {
            ...accumulator.days,
            [d]: day,
          },
        };
      }
    
      return {
        ...accumulator,
        days: {
          ...accumulator.days,
          [d]: null,
        },
      };
    }, {
      start: WORKDAY_START,
      end: WORKDAY_END,
      days: {},
    });
  });

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
    this.customerApiEvents.listCustomersInitiated();
    this.priceApiEvents.listPricesInitiated();

    effect(() => {
      if (this.year() && this.week()) {
        this.calendarEvents.listCalendarWeek({
          year: this.year(),
          week: this.week(),
        });
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
      this.navigationEvents.changeCalendarWeek({
        year: newYear,
        week: getISOWeek(lastDayOfISOWeekYear(new Date(newYear, 0))),
        weekOf: undefined,
      });
    } else if (newWeek > this.lastISOWeekOfYear()) {
      const newYear = this.year() + 1;
      this.navigationEvents.changeCalendarWeek({
        year: newYear,
        week: 1,
        weekOf: undefined,
      });
    } else {
      this.navigationEvents.changeCalendarWeek({
        year: this.year() !== this.today.getFullYear() ? this.year() : undefined,
        week: this.week() + diff,
        weekOf: undefined,
      });

    }

  }

  onShowToday() {
    this.navigationEvents.changeCalendarWeek({
      year: undefined,
      week: undefined,
      weekOf: undefined,
    });
  }

  onCreateWork() {
    this.calendarEvents.createCalendarEntry({
      entryType: CalendarEntryType.Work,
    });
  }

  onCreatePersonal() {
    this.calendarEvents.createCalendarEntry({
      entryType: CalendarEntryType.Personal,
    });
  }

  onCreateIssue() {
    this.calendarEvents.createCalendarEntry({
      entryType: CalendarEntryType.Issue,
    });
  }

  onSetWorkDay(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    this.calendarEvents.setWorkDay(day);
  }
}
