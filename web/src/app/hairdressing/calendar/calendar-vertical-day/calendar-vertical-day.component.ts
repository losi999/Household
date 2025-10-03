import { Component, Input, OnChanges } from '@angular/core';
import { dateToISODateString } from '@household/shared/common/utils';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { CustomerJob } from '@household/web/types/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-calendar-vertical-day',
  standalone: false,  
  templateUrl: './calendar-vertical-day.component.html',
  styleUrl: './calendar-vertical-day.component.scss',
})
export class CalendarVerticalDayComponent implements OnChanges {
  @Input() day: Calendar.Day.Response;
  @Input() column: number;

  @Input() pendingCustomerJob: CustomerJob;
  proposedTimeIntervals: Calendar.TimeInterval[];
  
  constructor(private store: Store) { }

  private calculateProposedTimeIntervals(): Calendar.TimeInterval[] {
    if (!this.pendingCustomerJob) {
      return [];
    }

    if (this.day.day <= dateToISODateString(new Date())) {
      return [];
    }

    if (this.day.dayType === CalendarDayType.Holiday || this.day.dayType === CalendarDayType.Vacation) {
      return [];
    }

    const blacklistedCustomerIds = this.pendingCustomerJob.customer.blacklistedCustomers.map(c => c.customerId);
    const entries = this.day.entries.filter(e => e.entryType !== CalendarEntryType.Issue);
    if (entries.some(e => e.entryType === CalendarEntryType.Work && blacklistedCustomerIds.includes(e.customer.customerId))) {
      return [];
    }

    const dayStart = this.day.start;
    const dayEnd = this.day.end;

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
        if (start && i - start >= this.pendingCustomerJob.duration) {
          intervals.push({
            start,
            end: i,
          });
        }
        start = undefined;
      }
    }

    if (start && dayEnd - start >= this.pendingCustomerJob.duration) {
      intervals.push({
        start,
        end: dayEnd,
      });
    }

    return intervals;
  }

  ngOnChanges(): void {
    this.proposedTimeIntervals = this.calculateProposedTimeIntervals();
  }
  
  onEntryClick(entry: Calendar.Entry.Response) {
    this.store.dispatch(dialogActions.openCalendarEntry({
      ...entry,
      day: this.day.day,
    }));    
  }

  onProposalClick(timeInterval: Calendar.TimeInterval) {
    if (this.pendingCustomerJob.duration === timeInterval.end - timeInterval.start) {
      this.store.dispatch(dialogActions.confirmCalendarEntryProposal({
        day: this.day.day,
        timeInterval: timeInterval,
        customerJob: this.pendingCustomerJob,
      }));
    } else {
      this.store.dispatch(dialogActions.createCalendarEntryWithProposal({
        customerJob: this.pendingCustomerJob,
        day: this.day.day,
        timeInterval: timeInterval,
      }));
    }
  }
}
