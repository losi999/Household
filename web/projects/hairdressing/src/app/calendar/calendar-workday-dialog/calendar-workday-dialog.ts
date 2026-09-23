import { Component, effect, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { CalendarDayType } from '@household/shared/enums';
import { AFTERNOON_SHIFT_END, AFTERNOON_SHIFT_START, MORNING_SHIFT_END, MORNING_SHIFT_START, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { FormsModule } from '@angular/forms';

enum ShiftType{
  Morning = 'morning',
  Afternoon = 'afternoon',
  Custom = 'custom',
}
export type CalendarWorkdayDialogData = Exclude<Responses.CalendarDay, Responses.CalendarDayHoliday>;
export type CalendarWorkdayDialogResult = Api.Calendar.Day & Partial<Requests.CalendarDay>;

@Component({
  selector: 'hairdressing-calendar-workday-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatRadioModule,
    TimeSlotToTimePipe,
    FormsModule,
  ],
  templateUrl: './calendar-workday-dialog.html',
  styleUrl: './calendar-workday-dialog.scss',
})
export class CalendarWorkdayDialog {
  private dialogRef = inject<MatDialogRef<CalendarWorkdayDialog, CalendarWorkdayDialogResult>>(MatDialogRef);
  day = inject<CalendarWorkdayDialogData>(MAT_DIALOG_DATA);

  shiftType = model(ShiftType.Custom);
  start = model<number>();
  end = model<number>();
  dayType = model<CalendarDayType>(this.day.dayType);

  constructor() {
    effect(() => {
      switch (this.shiftType()) {
        case ShiftType.Morning: {
          this.start.set(MORNING_SHIFT_START);
          this.end.set(MORNING_SHIFT_END);
        } break;
        case ShiftType.Afternoon: {
          this.start.set(AFTERNOON_SHIFT_START);
          this.end.set(AFTERNOON_SHIFT_END);
        } break;
        case ShiftType.Custom: {
          this.start.set(this.day.dayType === CalendarDayType.Vacation ? WORKDAY_START : this.day.start ?? WORKDAY_START);
          this.end.set(this.day.dayType === CalendarDayType.Vacation ? WORKDAY_END : this.day.end ?? WORKDAY_END);
        } break;
      }
    });
  }

  onSubmit() {
    if (this.dayType() === CalendarDayType.Vacation) {
      this.dialogRef.close({
        dayType: CalendarDayType.Vacation,
        day: this.day.day,          
      });     
    }

    if (this.dayType() === CalendarDayType.Regular) {
      this.dialogRef.close({
        dayType: CalendarDayType.Regular,
        day: this.day.day,
        start: this.start(),
        end: this.end(),
      });
    }
  }

  onDelete() {
    this.dialogRef.close({
      day: this.day.day,
    });
  }

}
