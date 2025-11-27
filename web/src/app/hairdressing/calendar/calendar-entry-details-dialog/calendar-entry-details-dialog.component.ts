import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Calendar } from '@household/shared/types/types';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';

export type CalendarEntryDetailsDialogData = Calendar.Entry.Response;
export enum CalendarEntryDetailsDialogResult {
  Edit = 'edit',
  Delete = 'delete',
  Pay = 'pay',
  NoShow = 'noShow',
}

@Component({
  imports: [
    MatDialogModule,
    IconTextComponent,
    DatePipe,
    TimeSlotToTimePipe,
    JobPriceSummaryComponent,
    MatButtonModule,
  ],
  templateUrl: './calendar-entry-details-dialog.component.html',
  styleUrl: './calendar-entry-details-dialog.component.scss',
})
export class CalendarEntryDetailsDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public entry: CalendarEntryDetailsDialogData) { }
}
