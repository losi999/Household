import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createDate, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

export type HairdressingCalendarEntryDialogData = Partial<Calendar.Entry.Response> & Partial<Calendar.DayProp>;

@Component({
  selector: 'household-hairdressing-calendar-entry-dialog',
  standalone: false,    
  templateUrl: './hairdressing-calendar-entry-dialog.component.html',
  styleUrl: './hairdressing-calendar-entry-dialog.component.scss',
})
export class HairdressingCalendarEntryDialogComponent implements OnInit {
  form: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    timeRange: FormControl<{
      start: number;
      end: number;
    }>;
  }>;

  constructor(private dialogRef: MatDialogRef<HairdressingCalendarEntryDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: HairdressingCalendarEntryDialogData) { }

  ngOnInit(): void {
    console.log(this.entry);
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    this.form = new FormGroup({
      title: new FormControl(this.entry?.title, [Validators.required]),
      description: new FormControl(this.entry.description),
      day: new FormControl(createDate(this.entry.day) ?? now, [Validators.required]),
      timeRange: new FormControl({
        start: this.entry?.start ?? dateToTimeSlot(now),
        end: this.entry?.end ?? dateToTimeSlot(now) + 4,
      }), 
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // const request: Calendar.Entry.Request = {
      //   title: this.form.value.title,
      //   description: this.form.value.description ?? undefined,
      //   entryType: this.entry.entryType,
      //   day: dateToISODateString(this.form.value.day),
      //   start: this.form.value.timeRange.start,
      //   end: this.form.value.timeRange.end,
      // };

      // if (this.entry.calendarEntryId) {
      //   this.store.dispatch(hairdressingApiActions.updateCalendarEntryInitiated({
      //     calendarEntryId: this.entry.calendarEntryId,
      //     ...request,
      //   }));
      // } else {
      //   this.store.dispatch(hairdressingApiActions.createCalendarEntryInitiated(request));
      // }

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
