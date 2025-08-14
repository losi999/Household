import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { addHours, createDate, dateToISODateString, dateToTimeSlot, timeSlotToDate } from '@household/shared/common/utils';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

type EntryResponse = Calendar.Entry.IssueEntryResponse | Calendar.Entry.PersonalEntryResponse;

export type HairdressingCalendarEntryFormData = Partial<Omit<EntryResponse, 'entryType'>> & Pick<EntryResponse, 'entryType'> & Partial<Calendar.DayProp>;

@Component({
  selector: 'household-hairdressing-calendar-entry-form',
  standalone: false,    
  templateUrl: './hairdressing-calendar-entry-form.component.html',
  styleUrl: './hairdressing-calendar-entry-form.component.scss',
})
export class HairdressingCalendarEntryFormComponent implements OnInit {
  form: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    start: FormControl<Date>;
    end: FormControl<Date>;
  }>;

  constructor(private dialogRef: MatDialogRef<HairdressingCalendarEntryFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: HairdressingCalendarEntryFormData) { }

  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    const end = addHours(1, now);
    this.form = new FormGroup({
      title: new FormControl(this.entry?.title, [Validators.required]),
      description: new FormControl(this.entry.description),
      day: new FormControl(createDate(this.entry.day) ?? now, [Validators.required]),
      start: new FormControl(this.entry.start ? timeSlotToDate(this.entry.start) : now, [Validators.required]),
      end: new FormControl(this.entry.end ? timeSlotToDate(this.entry.end) : end, [Validators.required]),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const request: Calendar.Entry.Request = {
        title: this.form.value.title,
        description: this.form.value.description ?? undefined,
        entryType: this.entry.entryType,
        day: dateToISODateString(this.form.value.day),
        start: dateToTimeSlot(this.form.value.start),
        end: dateToTimeSlot(this.form.value.end),
      };

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
      day: this.entry.day,
    }));
  }
}
