import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Calendar } from '@household/shared/types/types';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { PaginatePipe } from '@household/web/app/shared/pipes/paginate.pipe';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';

@Component({
  selector: 'household-customer-details-works',
  imports: [
    CommonModule,
    IconTextComponent,
    MatPaginatorModule,
    TimeSlotToTimePipe,
    MatListModule,
    PaginatePipe,
  ],
  templateUrl: './customer-details-works.component.html',
  styleUrl: './customer-details-works.component.scss',
})
export class CustomerDetailsWorksComponent {
  @Input() works: Calendar.Entry.WorkEntryResponseBase[];
  @Input() pageSize: number = 5;
  @Input() title: string;
}
