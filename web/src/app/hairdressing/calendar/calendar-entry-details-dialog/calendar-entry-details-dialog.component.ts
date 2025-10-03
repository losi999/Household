import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { calendarActions } from '@household/web/state/calendar/calendar.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

export type CalendarEntryDetailsDialogData = Calendar.Entry.Response;

@Component({
  selector: 'household-calendar-entry-details-dialog',
  standalone: false,
  templateUrl: './calendar-entry-details-dialog.component.html',
  styleUrl: './calendar-entry-details-dialog.component.scss',
})
export class CalendarEntryDetailsDialogComponent {

  constructor(private dialogRef: MatDialogRef<CalendarEntryDetailsDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryDetailsDialogData) { }

  onEdit() {
    this.store.dispatch(dialogActions.updateCalendarEntry({
      ...this.entry,
    }));

    this.dialogRef.close();
  }

  onDelete() {
    this.store.dispatch(dialogActions.deleteCalendarEntry({
      calendarEntryId: this.entry.calendarEntryId,
      title: this.entry.title,
    }));
  }

  onPaying() {
    if (this.entry.entryType === CalendarEntryType.Work) {
      this.store.dispatch(calendarActions.openPayingDialog(this.entry));
    }
  }
}
