import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { IconText } from '@household/shared-ui';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatePipe } from '@hairdressing/app/pipes/paginate-pipe';
import { Calendar } from '@household/shared/types/types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'hairdressing-customer-details-works',
  imports: [
    IconText,
    MatPaginatorModule,
    TimeSlotToTimePipe,
    MatListModule,
    PaginatePipe,
    DatePipe,
  ],
  templateUrl: './customer-details-works.html',
  styleUrl: './customer-details-works.scss',
})
export class CustomerDetailsWorks {
  works = input.required<Calendar.Entry.WorkEntryResponseBase[]>();
  pageSize = input(5);
  title = input.required<string>();
}
