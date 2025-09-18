import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

export type HairdressingCalendarEntryDetailsDialogData = Calendar.Entry.Response & Calendar.DayProp;

@Component({
  selector: 'household-hairdressing-calendar-entry-details-dialog',
  standalone: false,
  templateUrl: './hairdressing-calendar-entry-details-dialog.component.html',
  styleUrl: './hairdressing-calendar-entry-details-dialog.component.scss',
})
export class HairdressingCalendarEntryDetailsDialogComponent {

  constructor(private dialogRef: MatDialogRef<HairdressingCalendarEntryDetailsDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: HairdressingCalendarEntryDetailsDialogData) { }

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
}
