import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { JobPriceSummary } from '@hairdressing/app/shared/job-price-summary/job-price-summary';
import { IconText } from '@household/shared-ui';
import { dateToISODateString } from '@household/shared/common/utils';
import { Calendar } from '@household/shared/types/types';

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
    IconText,
    JobPriceSummary,
    MatButtonModule,
    DatePipe,
    TimeSlotToTimePipe,
  ],
  templateUrl: './calendar-entry-details-dialog.html',
  styleUrl: './calendar-entry-details-dialog.scss',
})
export class CalendarEntryDetailsDialog {
  entry = inject<CalendarEntryDetailsDialogData>(MAT_DIALOG_DATA);

  isInThePast = computed(() => {
    return this.entry.day <= dateToISODateString(new Date());
  });

}
