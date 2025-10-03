import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AFTERNOON_SHIFT_END, AFTERNOON_SHIFT_START, MORNING_SHIFT_END, MORNING_SHIFT_START, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';

import { Store } from '@ngrx/store';

enum ShiftType{
  Morning = 'morning',
  Afternoon = 'afternoon',
  Custom = 'custom',
}
export type CalendarWorkdayDialogData = Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>;

@Component({
  standalone: false,  
  templateUrl: './calendar-workday-dialog.component.html',
  styleUrl: './calendar-workday-dialog.component.scss',
})
export class CalendarWorkdayDialogComponent implements OnInit {
  form: FormGroup<{
    dayType: FormControl<CalendarDayType>;
    shiftType: FormControl<ShiftType>;
    start: FormControl<number>;
    end: FormControl<number>;
  }>;

  constructor(private dialogRef: MatDialogRef<CalendarWorkdayDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public day: CalendarWorkdayDialogData) { }
  
  ngOnInit(): void {
    this.form = new FormGroup({
      dayType: new FormControl<CalendarDayType>(this.day.dayType !== CalendarDayType.Weekend ? this.day.dayType : CalendarDayType.Workday),
      shiftType: new FormControl<ShiftType>(ShiftType.Custom),
      start: new FormControl(this.day.dayType === CalendarDayType.Vacation ? WORKDAY_START : this.day.plannedStart ?? WORKDAY_START),
      end: new FormControl(this.day.dayType === CalendarDayType.Vacation ? WORKDAY_END : this.day.plannedEnd ?? WORKDAY_END),
    });

    this.form.controls.shiftType.valueChanges.subscribe((value) => {
      switch (value) {
        case ShiftType.Morning: {
          this.form.patchValue({
            start: MORNING_SHIFT_START,
            end: MORNING_SHIFT_END,
          });
        } break;
        case ShiftType.Afternoon: {
          this.form.patchValue({
            start: AFTERNOON_SHIFT_START,
            end: AFTERNOON_SHIFT_END,
          });
        } break;
        case ShiftType.Custom: {
          this.form.patchValue({
            start: WORKDAY_START,
            end: WORKDAY_END,
          });
        } break;
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.form.value.dayType === CalendarDayType.Vacation) {
        this.store.dispatch(calendarApiActions.updateCalendarDayInitiated({
          dayType: CalendarDayType.Vacation,
          day: this.day.day,
        }));        
      }

      if (this.form.value.dayType === CalendarDayType.Workday) {
        this.store.dispatch(calendarApiActions.updateCalendarDayInitiated({
          dayType: CalendarDayType.Workday,
          day: this.day.day,
          start: this.form.value.start,
          end: this.form.value.end,
        }));
      }

      this.dialogRef.close();
    }
  }

  onDelete() {
    this.store.dispatch(calendarApiActions.deleteCalendarDayInitiated({
      day: this.day.day,
    }));

    this.dialogRef.close();
  }
}
