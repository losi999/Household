import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { createDate, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

export type HairdressingCalendarEntryEditDialogData = Partial<Calendar.Entry.Response> & Partial<Calendar.DayProp>;

@Component({
  standalone: false,    
  templateUrl: './hairdressing-calendar-entry-edit-dialog.component.html',
  styleUrl: './hairdressing-calendar-entry-edit-dialog.component.scss',
})
export class HairdressingCalendarEntryEditDialogComponent implements OnInit {
  form: FormGroup<{
    job: FormControl<Customer.CustomerId & {
      job?: Customer.Job.Response;
    }>
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    timeRange: FormControl<{
      start: number;
      end: number;
    }>;
  }>;

  constructor(private dialogRef: MatDialogRef<HairdressingCalendarEntryEditDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: HairdressingCalendarEntryEditDialogData) { }

  ngOnInit(): void {
    console.log(this.entry);

    if (this.entry.entryType === CalendarEntryType.Work) {
      this.store.dispatch(customerApiActions.listCustomersInitiated());
    }

    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    this.form = new FormGroup({
      job: new FormControl(null),
      title: new FormControl(this.entry?.title, [Validators.required]),
      description: new FormControl(this.entry.description),
      day: new FormControl(createDate(this.entry.day) ?? now, [Validators.required]),
      timeRange: new FormControl({
        start: this.entry?.start ?? dateToTimeSlot(now),
        end: this.entry?.end ?? dateToTimeSlot(now) + 4,
      }), 
    });

    this.form.controls.job.valueChanges.pipe(filter(x => !!x)).subscribe(({ job }) => {
      this.form.patchValue({
        title: job?.name,
        description: job?.description,
      });
    });
  }

  onSubmit() {
    console.log(this.form.value);
    if (this.form.valid) {
      let request: Calendar.Entry.Request;

      if (this.entry.entryType === CalendarEntryType.Work) {
        request = {
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.timeRange.start,
          end: this.form.value.timeRange.end,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
          customerId: this.form.value.job.customerId,
          prices: this.form.value.job.job?.prices.map((p) => {
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
      } else {
        request = {
          entryType: this.entry.entryType,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.timeRange.start,
          end: this.form.value.timeRange.end,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
        };
      }

      console.log(request);

      if (this.entry.calendarEntryId) {
        this.store.dispatch(hairdressingApiActions.updateCalendarEntryInitiated({
          calendarEntryId: this.entry.calendarEntryId,
          ...request,
        }));
      } else {
        this.store.dispatch(hairdressingApiActions.createCalendarEntryInitiated(request));
      }

      this.dialogRef.close();
    }
  }

  onDelete() {
    this.store.dispatch(dialogActions.deleteCalendarEntry({
      calendarEntryId: this.entry.calendarEntryId,
      title: this.entry.title,
    }));
  }
}
