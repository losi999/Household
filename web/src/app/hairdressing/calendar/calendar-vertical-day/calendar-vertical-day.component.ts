import { Component, Input, OnChanges } from '@angular/core';
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
  proposedTimeslots: Calendar.Timespan[];
  
  constructor(private store: Store) { }

  private calculateProposedTimeslots(): Calendar.Timespan[] {
    if (!this.pendingCustomerJob) {
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

    const ranges: Calendar.Timespan[] = [];
    let start: number;

    for (let i = dayStart; i < dayEnd; i += 1) {
      if (openSlots[i]) {
        if (!start) {
          start = i;
        }
      } else {
        if (start && i - start >= this.pendingCustomerJob.duration) {
          ranges.push({
            start,
            end: i,
          });
        }
        start = undefined;
      }
    }

    if (start && dayEnd - start >= this.pendingCustomerJob.duration) {
      ranges.push({
        start,
        end: dayEnd,
      });
    }

    return ranges;
  }

  ngOnChanges(): void {
    this.proposedTimeslots = this.calculateProposedTimeslots();
  }
  
  onEntryClick(entry: Calendar.Entry.Response) {
    this.store.dispatch(dialogActions.openCalendarEntry({
      ...entry,
      day: this.day.day,
    }));    
  }

  onProposalClick(slot: Calendar.Timespan) {

    if (this.pendingCustomerJob.duration === slot.end - slot.start) {
      this.store.dispatch(dialogActions.confirmCalendarEntryProposal({
        day: this.day.day,
        timeslot: slot,
        customerJob: this.pendingCustomerJob,
      }));
      console.log('Confirm?');
    }
    console.log(this.day);
    console.log(this.pendingCustomerJob);
    console.log(slot);
  }

  // onGridClick(event: PointerEvent) {
  //   if (event.target !== event.currentTarget) {
  //     return;
  //   }
  //   const gridElement = event.currentTarget as HTMLElement;
  //   const rect = gridElement.getBoundingClientRect();

  //   const y = event.clientY - rect.top;

  //   const row = Math.floor(y / 20) + 1;
  //   console.log(row);

  //   if (!this.day.entries.some(e => e.start < row && e.end >= row)) {
  //     alert(`Kiválasztott időpont: ${addMinutes((row - 1) * 15, this.day.date)}`);
  //   }

  // }
}
