import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CustomerJob, LimitedCalendarDay } from '@hairdressing/types';
import { dateToISODateString } from '@household/shared/common/utils';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'hairdressing-calendar-vertical-day',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    TimeSlotToTimePipe,
  ],
  templateUrl: './calendar-vertical-day.html',
  styleUrl: './calendar-vertical-day.scss',
})
export class CalendarVerticalDay {
  private calendarEvents = injectDispatch(calendarEvents);

  day = input.required<LimitedCalendarDay>();
  column = input.required<number>();
  pendingCustomerJob = input<CustomerJob>();

  proposedTimeIntervals = computed<Calendar.TimeInterval[]>(() => {
    if (!this.pendingCustomerJob()) {
      return [];
    }

    if (this.isInThePast()) {
      return [];
    }

    const day = this.day();

    if (day.dayType === CalendarDayType.Holiday || day.dayType === CalendarDayType.Vacation) {
      return [];
    }

    const blacklistedCustomerIds = this.pendingCustomerJob().customer.blacklistedCustomers.map(c => c.customerId);
    const entries = day.entries.filter(e => e.entryType !== CalendarEntryType.Issue);
    if (entries.some(e => e.entryType === CalendarEntryType.Work && blacklistedCustomerIds.includes(e.customer.customerId))) {
      return [];
    }

    const dayStart = day.calculatedStart;
    const dayEnd = day.calculatedEnd;

    const openSlots = Array.from({
      length: 96,
    }, (_, index) => index >= dayStart && index < dayEnd);
      
    entries.forEach((e) => {
      for (let i = e.start; i < e.end; i += 1) {
        openSlots[i] = false;
      }
    });

    const intervals: Calendar.TimeInterval[] = [];
    let start: number;

    for (let i = dayStart; i < dayEnd; i += 1) {
      if (openSlots[i]) {
        if (!start) {
          start = i;
        }
      } else {
        if (start && i - start >= this.pendingCustomerJob().duration) {
          intervals.push({
            start,
            end: i,
          });
        }
        start = undefined;
      }
    }

    if (start && dayEnd - start >= this.pendingCustomerJob().duration) {
      intervals.push({
        start,
        end: dayEnd,
      });
    }

    return intervals;

  });
  isInThePast = computed(() => {
    return this.day().day <= dateToISODateString(new Date());
  });

  onEntryClick(entry: Calendar.Entry.Response) {
    this.calendarEvents.viewCalendarEntry({
      ...entry,
      day: this.day().day,
    });    
  }

  onProposalClick(timeInterval: Calendar.TimeInterval) {
    if (this.pendingCustomerJob().duration === timeInterval.end - timeInterval.start) {
      this.calendarEvents.confirmCalendarEntryProposal({
        day: this.day().day,
        timeInterval: timeInterval,
        customerJob: this.pendingCustomerJob(),
      });
    } else {
      this.calendarEvents.createCalendarEntryWithProposal({
        customerJob: this.pendingCustomerJob(),
        day: this.day().day,
        timeInterval: timeInterval,
      });
    }
  }
}
