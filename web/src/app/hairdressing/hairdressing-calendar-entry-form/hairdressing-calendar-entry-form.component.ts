import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { addHours, addMinutes, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

export type HairdressingCalendarEntryFormData = {
  entryType: CalendarEntryType.Issue | CalendarEntryType.Personal;
};

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
    @Inject(MAT_DIALOG_DATA) public data: HairdressingCalendarEntryFormData) { }

  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    const end = addHours(1, now);
    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      day: new FormControl(now, [Validators.required]),
      start: new FormControl(now, [Validators.required]),
      end: new FormControl(end, [Validators.required]),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(hairdressingApiActions.createCalendarEntryInitiated({
        title: this.form.value.title,
        description: this.form.value.description ?? undefined,
        entryType: this.data.entryType,
        day: dateToISODateString(this.form.value.day),
        start: dateToTimeSlot(this.form.value.start),
        end: dateToTimeSlot(this.form.value.end),
      }));

      this.dialogRef.close();
    }
  }
}
