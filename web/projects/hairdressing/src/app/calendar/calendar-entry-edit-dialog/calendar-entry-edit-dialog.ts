import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClearableInput } from '@household/shared-ui';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { form, FormField, required } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { createDate, createWorkEntryTitle, dateToISODateString, dateToTimeSlot, toUndefined } from '@household/shared/common/utils';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { FormsModule } from '@angular/forms';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';
import { MatSelectModule } from '@angular/material/select';
import { v4 } from 'uuid';

export type CalendarEntryEditDialogData = Partial<Calendar.Entry.Response>;
export type CalendarEntryEditDialogResult = Calendar.Entry.Request;

@Component({
  selector: 'hairdressing-calendar-entry-edit-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ClearableInput,
    DurationStepper,
    MatSliderModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormField,
    TimeSlotToTimePipe,
    FormsModule,
    CustomerAutocompleteInput,
    MatSelectModule,
  ],
  templateUrl: './calendar-entry-edit-dialog.html',
  styleUrl: './calendar-entry-edit-dialog.scss',
})
export class CalendarEntryEditDialog {
  private dialogRef = inject<MatDialogRef<CalendarEntryEditDialog, CalendarEntryEditDialogResult>>(MatDialogRef);
  entry = inject<CalendarEntryEditDialogData>(MAT_DIALOG_DATA);

  CUSTOM_JOB: Customer.Job.Response = {
    name: v4(),
    duration: 0,
    description: undefined,
    prices: undefined,
    additionalPrice: undefined,
  };

  title = computed(() => {
    let title = '';
    switch(this.entry.entryType) {
      case CalendarEntryType.Issue: {
        title = 'Probléma';
      } break;
      case CalendarEntryType.Work: {
        title = 'Munka';
      } break;
      case CalendarEntryType.Personal: {
        title = 'Személyes program';
      } break;
    }
    if (this.entry.calendarEntryId) {
      title += ' szerkesztése';
    } else {
      title += ' rögzítése';
    }

    return title;
  });

  entryModel = signal<{
    customer: Customer.Response,
    job: Customer.Job.Response,
    title: string;
    description: string;
    day: Date;
  }>({
    customer: null,
    job: null,
    title: this.entry.title ?? '',
    description: this.entry.description ?? '',
    day: createDate(this.entry.day) ?? new Date(),
  });

  entryForm = form(this.entryModel, (schemaPath) => {
    required(schemaPath.title, {
      message: 'Kötelező',
    });
    if (this.entry.entryType === CalendarEntryType.Work) {
      required(schemaPath.customer, {
        message: 'Kötelező',
      });
      required(schemaPath.job, {
        message: 'Kötelező',
      });
    }
  });

  start = model<number>(this.entry.start ?? dateToTimeSlot(new Date()));
  duration = model<number>(this.entry.end - this.entry.start || 4);

  constructor() {
    effect(() => {
      this.start.set(Math.min(96 - this.duration(), this.start()));
    });

    effect(() => {
      const selectedCustomer = this.entryForm.customer().value();
      console.log('customer changed', selectedCustomer);

      if (!selectedCustomer) {
        this.entryForm.job().value.set(null);
      }
    });

    effect(() => {
      console.log('job changed', this.entryForm.job().value());
      const selectedJob = this.entryForm.job().value();

      // if (!selectedJob) {
      //   return;
      // }

      if (selectedJob.name === this.CUSTOM_JOB.name) {
        this.entryForm.title().value.set(createWorkEntryTitle(this.entryForm.customer().value()));
      } else {
        this.entryForm.title().value.set(createWorkEntryTitle(this.entryForm.customer().value(), selectedJob));
        this.entryForm.description().value.set(selectedJob.description);
        this.duration.set(selectedJob.duration ?? 4);
      }

    });
  }

  onSubmit() {
    Object.values(this.entryForm).forEach(field => {
      field().markAsTouched();
    });

    console.log(this.entryForm().value());

    if (this.entryForm().valid()) {
      if (this.entry.entryType === CalendarEntryType.Work) {
        const selectedJob = this.entryForm.job().value();

        this.dialogRef.close({
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.entryForm.day().value()),
          start: this.start(),
          end: this.start() + this.duration(),
          title: this.entryForm.title().value(),
          description: toUndefined(this.entryForm.description().value()),
          customerId: this.entryForm.customer().value().customerId,
          additionalPrice: selectedJob.additionalPrice,
          prices: selectedJob.prices?.map((p) => {
            return {
              priceId: p.priceId,
              quantity: p.quantity,
            };
          }),

        });
      } else { 
        this.dialogRef.close({
          entryType: this.entry.entryType,
          day: dateToISODateString(this.entryForm.day().value()),
          start: this.start(),
          end: this.start() + this.duration(),
          title: this.entryForm.title().value(),
          description: toUndefined(this.entryForm.description().value()),
        });
      }
    }
  }
}
