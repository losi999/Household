import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { createDate, createWorkEntryTitle, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { selectCalendarDay } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
import { Store } from '@ngrx/store';
import { filter, Observable, startWith, switchMap, take } from 'rxjs';
import { calendarActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { v4 } from 'uuid';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DurationStepperComponent } from '@household/web/app/shared/duration-stepper/duration-stepper.component';
import { MatSliderModule } from '@angular/material/slider';
import { CalendarHorizontalDayComponent } from '@household/web/app/hairdressing/calendar/calendar-horizontal-day/calendar-horizontal-day.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';
import { AsyncPipe } from '@angular/common';
import { EntryWarningsPipe } from '@household/web/app/hairdressing/calendar/pipes/entry-warnings.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

export type CalendarEntryEditDialogData = Partial<Calendar.Entry.Response>;
export type CalendarEntryEditDialogResult = Calendar.Entry.Request;

@Component({
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    CustomerAutocompleteInputComponent,
    MatFormFieldModule,
    MatSelectModule,
    ClearableInputComponent,
    MatDatepickerModule,
    DurationStepperComponent,
    MatSliderModule,
    CalendarHorizontalDayComponent,
    TimeSlotToTimePipe,
    AsyncPipe,
    EntryWarningsPipe,
    MatButtonModule,
    MatInputModule,
  ],    
  templateUrl: './calendar-entry-edit-dialog.component.html',
  styleUrl: './calendar-entry-edit-dialog.component.scss',
})
export class CalendarEntryEditDialogComponent implements OnInit {
  form: FormGroup<{
    customer: FormControl<Customer.Response>;
    job: FormControl<Customer.Job.Response>;
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    start: FormControl<number>;
    duration: FormControl<number>;
  }>;

  calendarDay: Observable<Calendar.Day.Response>;
  title: string;
  CUSTOM_JOB: Customer.Job.Response;

  constructor(private dialogRef: MatDialogRef<CalendarEntryEditDialogComponent, CalendarEntryEditDialogResult>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryEditDialogData) { }

  ngOnInit(): void {
    this.CUSTOM_JOB = {
      name: v4(),
      duration: 0,
      description: undefined,
      prices: undefined,
    };

    switch(this.entry.entryType) {
      case CalendarEntryType.Issue: {
        this.title = 'Probléma';
      } break;
      case CalendarEntryType.Work: {
        this.title = 'Munka';
      } break;
      case CalendarEntryType.Personal: {
        this.title = 'Személyes program';
      } break;
    }
    if (this.entry.calendarEntryId) {
      this.title += ' szerkesztése';
    } else {
      this.title += ' rögzítése';
    }

    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);

    let customer: Customer.Response = null;
    let job: Customer.Job.Response = null;

    if (this.entry.entryType === CalendarEntryType.Work && this.entry.customer) {
      customer = this.entry.customer;
      job = this.entry.customer.jobs.find(j => this.entry.title.endsWith(j.name)) ?? this.CUSTOM_JOB;
    }

    this.form = new FormGroup({
      customer: new FormControl(customer, this.entry.entryType === CalendarEntryType.Work ? [Validators.required] : []),
      job: new FormControl(job, this.entry.entryType === CalendarEntryType.Work ? [Validators.required] : []),
      title: new FormControl(this.entry.title, [Validators.required]),
      description: new FormControl(this.entry.description),
      day: new FormControl(createDate(this.entry.day) ?? now, [Validators.required]),
      start: new FormControl(this.entry.start ?? dateToTimeSlot(now)),
      duration: new FormControl(this.entry.end - this.entry.start || 4),
    });

    this.form.controls.customer.valueChanges.subscribe(() => {
      this.form.patchValue({
        job: null,
      }, {
        emitEvent: false,
      });
    });

    this.form.controls.job.valueChanges.pipe(filter(x => !!x)).subscribe((job) => { 
      if (job.name === this.CUSTOM_JOB.name) {
        this.form.patchValue({
          title: createWorkEntryTitle(this.form.value.customer),
        });  
      } else { 
        this.form.patchValue({
          title: createWorkEntryTitle(this.form.value.customer, job),
          description: job?.description,
          duration: job?.duration ?? 4,
        });
      }
    });

    this.calendarDay = this.form.controls.day.valueChanges.pipe(startWith(this.form.value.day), switchMap((date) => {
      const obs = this.store.select(selectCalendarDay(date));

      obs.pipe(take(1)).subscribe((value) => {
        if (!value) {
          this.store.dispatch(calendarActions.listCalendarMonth({
            date, 
          }));
        }
      });

      return obs;
    }));
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.entry.entryType === CalendarEntryType.Work) {
        this.dialogRef.close({
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.start,
          end: this.form.value.start + this.form.value.duration,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
          customerId: this.form.value.customer.customerId,
          prices: this.form.value.job.name === this.CUSTOM_JOB.name ? undefined : this.form.value.job?.prices.map((p) => {
            if (p.priceId) {
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
        });
      } else {
        this.dialogRef.close({
          entryType: this.entry.entryType,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.start,
          end: this.form.value.start + this.form.value.duration,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
        });
      }
    }
  }
}
