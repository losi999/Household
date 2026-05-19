import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClearableInput, HoldableButton } from '@household/shared-ui';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { form, FormField, required } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { calculateWorkdayLimits, createDate, createWorkEntryTitle, dateToISODateString, dateToTimeSlot, toUndefined } from '@household/shared/common/utils';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';
import { MatSelectModule } from '@angular/material/select';
import { v4 } from 'uuid';
import { CalendarHorizontalDay } from '@hairdressing/app/calendar/calendar-horizontal-day/calendar-horizontal-day';
import { LimitedCalendarDay } from '@hairdressing/types';
import { CalendarStore } from '@hairdressing/state/calendar/calendar-store';
import { injectDispatch } from '@ngrx/signals/events';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { MatIconModule } from '@angular/material/icon';

export type CalendarEntryEditDialogData = Partial<Calendar.Entry.Response>;
export type CalendarEntryEditDialogResult = Calendar.Entry.Request;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ClearableInput,
    DurationStepper,
    MatSliderModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormField,
    TimeSlotToTimePipe,
    CustomerAutocompleteInput,
    MatSelectModule,
    CalendarHorizontalDay,
    HoldableButton,
  ],
  templateUrl: './calendar-entry-edit-dialog.html',
  styleUrl: './calendar-entry-edit-dialog.scss',
})
export class CalendarEntryEditDialog {
  private calendarStore = inject(CalendarStore);
  private calendarEvents = injectDispatch(calendarEvents);
  private dialogRef = inject<MatDialogRef<CalendarEntryEditDialog, CalendarEntryEditDialogResult>>(MatDialogRef);
  entry = inject<CalendarEntryEditDialogData>(MAT_DIALOG_DATA);

  CUSTOM_JOB: Customer.Job.Response = {
    name: v4(),
    duration: 4,
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
    start: number;
    duration: number;
  }>({
    customer: this.entry.entryType === CalendarEntryType.Work ? this.entry.customer ?? null : null,
    job: this.entry.entryType === CalendarEntryType.Work ? this.entry.customer?.jobs.find(j => this.entry.title.endsWith(j.name)) ?? this.CUSTOM_JOB : null,
    title: this.entry.title ?? '',
    description: this.entry.description ?? '',
    day: createDate(this.entry.day) ?? new Date(),
    start: this.entry.start ?? dateToTimeSlot(new Date()),
    duration: this.entry.end - this.entry.start || 4,
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

  calendarDay = computed(() => {
    const date = this.entryForm.day().value();
    const day = this.calendarStore.days()[dateToISODateString(date)];

    if (!day) {
      return day;
    }

    const index = day.entries.findIndex(e => e.calendarEntryId === this.entry?.calendarEntryId);
   
    if (index < 0) {
      return day;
    } 
      
    const newDay: LimitedCalendarDay = {
      ...day,
      entries: day.entries.toSpliced(index, 1),
    };

    const { start, end } = calculateWorkdayLimits(newDay);

    return {
      ...newDay,
      calculatedStart: start,
      calculatedEnd: end,
    };
  });

  entryWarnings = computed(() => {
    const errors = [];

    if (this.entry.entryType === CalendarEntryType.Work) {
      if (this.entryForm.duration().value() < this.entryForm.job().value()?.duration) {
        errors.push('Időtartam kevesebb, mint a munkához rögzített');
      }
      
      switch (this.calendarDay()?.dayType) {
        case CalendarDayType.Vacation: {
          errors.push('Ezt a napot szabadságnak jelölted');
        } break;
        case CalendarDayType.Holiday: {
          errors.push('Munkaszüneti nap');
        } break;
        case CalendarDayType.Weekend: {
          errors.push('Hétvége');
        } break;
        case CalendarDayType.Workday: {
          if (this.entryForm.start().value() < this.calendarDay().calculatedStart || this.end() > this.calendarDay().calculatedEnd) {
            errors.push('Túlóra');
          }
        } break;
      }
    }

    this.calendarDay()?.entries.filter(e => !(this.entryForm.start().value() >= e.end || this.end() <= e.start)).forEach((e) => {
      let entryTypeText: string;
      switch(e.entryType) {
        case CalendarEntryType.Work: {
          entryTypeText = 'munkával';
        } break;
        case CalendarEntryType.Issue: {
          entryTypeText = 'problémával';
        } break;
        case CalendarEntryType.Personal: {
          entryTypeText = 'személyes programmal';
        } break;
      }
      errors.push(`Ütközik az alábbi ${entryTypeText}: ${e.title}`);
    });

    return errors;
  });

  maximumStart = computed(() => {
    return 96 - this.entryForm.duration().value();
  });

  end = computed(() => {
    return this.entryForm.start().value() + this.entryForm.duration().value();
  });

  constructor() {
    effect(() => {
      if (!this.calendarDay()) {
        this.calendarEvents.listCalendarMonth(this.entryForm.day().value());
      }
    });

    effect(() => {
      console.log('duration changed');
      this.entryForm.start().value.update(current => Math.min(this.maximumStart(), current));
    });

    effect(() => {
      if (this.entry.entryType !== CalendarEntryType.Work) {
        return;
      }
      
      const selectedCustomer = this.entryForm.customer().value();

      if (!selectedCustomer) {
        this.entryForm.job().value.set(null);
        this.entryForm.job().reset();
      }
    });

    effect(() => {
      if (this.entry.entryType !== CalendarEntryType.Work) {
        return;
      }
      const selectedJob = this.entryForm.job().value();

      if (!selectedJob) {
        this.entryForm.title().reset(null);
        this.entryForm.duration().value.set(4);
        return;
      }
      this.entryForm.duration().value.set(selectedJob.duration);

      if (selectedJob.name !== this.CUSTOM_JOB.name) {
        const newTitle = createWorkEntryTitle(this.entryForm.customer().value(), selectedJob);
        this.entryForm.title().value.set(newTitle);
      } else {
        const newTitle = createWorkEntryTitle(this.entryForm.customer().value());
        this.entryForm.title().value.set(newTitle);
      }
    });
  }

  onAdjustStart(value: number) {
    this.entryForm.start().value.update(current => current + value);
  }

  onSubmit() {
    Object.values(this.entryForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.entryForm().valid()) {
      if (this.entry.entryType === CalendarEntryType.Work) {
        const selectedJob = this.entryForm.job().value();

        this.dialogRef.close({
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.entryForm.day().value()),
          start: this.entryForm.start().value(),
          end: this.end(),
          title: this.entryForm.title().value(),
          description: toUndefined(selectedJob.description) ?? toUndefined(this.entryForm.description().value()),
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
          start: this.entryForm.start().value(),
          end: this.end(),
          title: this.entryForm.title().value(),
          description: toUndefined(this.entryForm.description().value()),
        });
      }
    }
  }
}
