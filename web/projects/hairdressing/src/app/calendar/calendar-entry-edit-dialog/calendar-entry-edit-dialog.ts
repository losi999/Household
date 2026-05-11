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
import { createDate, dateToISODateString, dateToTimeSlot, toUndefined } from '@household/shared/common/utils';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { FormsModule } from '@angular/forms';
import { destroyDetachedRouteHandle } from '@angular/router';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';

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
  ],
  templateUrl: './calendar-entry-edit-dialog.html',
  styleUrl: './calendar-entry-edit-dialog.scss',
})
export class CalendarEntryEditDialog {
  private dialogRef = inject<MatDialogRef<CalendarEntryEditDialog, CalendarEntryEditDialogResult>>(MatDialogRef);
  entry = inject<CalendarEntryEditDialogData>(MAT_DIALOG_DATA);

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
    title: string;
    description: string;
    day: Date;
  }>({
    title: this.entry.title ?? '',
    description: this.entry.description ?? '',
    day: createDate(this.entry.day) ?? new Date(),
  });

  entryForm = form(this.entryModel, (schemaPath) => {
    required(schemaPath.title, {
      message: 'Kötelező',
    });
    // if (this.entry.entryType === CalendarEntryType.Work) {
    //   required(schemaPath.customer, {
    //     message: 'Kötelező',
    //   });
    // }
  });

  start = model<number>(this.entry.start ?? dateToTimeSlot(new Date()));
  duration = model<number>(this.entry.end - this.entry.start || 4);

  constructor() {
    effect(() => {
      this.start.set(Math.min(96 - this.duration(), this.start()));
    });
  }

  onSubmit() {
    Object.values(this.entryForm).forEach(field => {
      field().markAsTouched();
    });

    console.log(this.entryForm().value());

    if (this.entryForm().valid()) {
      if (this.entry.entryType === CalendarEntryType.Work) {
        // TODO
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
