import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Calendar } from '@household/shared/types/types';

export type CalendarEntryDetailsDialogData = Calendar.Entry.Response;
export type CalendarEntryDetailsDialogResult = 'edit' | 'delete' | 'pay';

@Component({
  selector: 'household-calendar-entry-details-dialog',
  standalone: false,
  templateUrl: './calendar-entry-details-dialog.component.html',
  styleUrl: './calendar-entry-details-dialog.component.scss',
})
export class CalendarEntryDetailsDialogComponent {

  constructor(private dialogRef: MatDialogRef<CalendarEntryDetailsDialogComponent, CalendarEntryDetailsDialogResult>,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryDetailsDialogData) { }

  onEdit() {
    this.dialogRef.close('edit');
  }

  onDelete() {
    this.dialogRef.close('delete');
  }

  onPaying() {
    this.dialogRef.close('pay');
  }
}
