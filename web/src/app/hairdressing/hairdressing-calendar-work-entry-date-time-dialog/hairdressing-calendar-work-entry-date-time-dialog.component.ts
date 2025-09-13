import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

export type HairdressingCalendarWorkEntryDateTimeDialogData = Customer.CustomerId & { job: Customer.Job.Response };

@Component({
  selector: 'household-hairdressing-calendar-work-entry-date-time-dialog',
  standalone: false,  
  templateUrl: './hairdressing-calendar-work-entry-date-time-dialog.component.html',
  styleUrl: './hairdressing-calendar-work-entry-date-time-dialog.component.scss',
})
export class HairdressingCalendarWorkEntryDateTimeDialogComponent implements OnInit {
  form: FormGroup<{
    day: FormControl<Date>;
    timeRange: FormControl<{
      start: number;
      end: number;
    }>;
  }>;

  constructor(private dialogRef: MatDialogRef<HairdressingCalendarWorkEntryDateTimeDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: HairdressingCalendarWorkEntryDateTimeDialogData) { }
  
  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);

    this.form = new FormGroup({
      day: new FormControl(now, [Validators.required]),
      timeRange: new FormControl({
        start: dateToTimeSlot(now),
        end: dateToTimeSlot(now) + this.data.job.duration,
      }), 
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const request: Calendar.Entry.WorkEntryRequest = {
        entryType: CalendarEntryType.Work,
        customerId: this.data.customerId,
        description: this.data.job.description,
        title: this.data.job.name,
        day: dateToISODateString(this.form.value.day),
        start: this.form.value.timeRange.start,
        end: this.form.value.timeRange.end,
        prices: this.data.job.prices.map((p) => {
          if (isListedPrice(p)) {
            return {
              priceId: p.priceId,
              quantity: p.quantity,
            };
          }

          return {
            name: p.name,
            amount: p.amount,
          };
        }),
      };

      this.store.dispatch(hairdressingApiActions.createCalendarEntryInitiated(request));

      this.dialogRef.close();
    }
  }
}
