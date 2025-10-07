import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Calendar } from '@household/shared/types/types';

export type CalendarEntryDetailsDialogData = Calendar.Entry.Response;
export type CalendarEntryDetailsDialogResult = 'edit' | 'delete' | 'pay';

@Component({
  standalone: false,
  templateUrl: './calendar-entry-details-dialog.component.html',
  styleUrl: './calendar-entry-details-dialog.component.scss',
})
export class CalendarEntryDetailsDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public entry: CalendarEntryDetailsDialogData) { }
}
