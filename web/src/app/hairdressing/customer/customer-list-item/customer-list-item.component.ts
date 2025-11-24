import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';

@Component({
  selector: 'household-customer-list-item',
  templateUrl: './customer-list-item.component.html',
  styleUrl: './customer-list-item.component.scss',
  imports: [
    IconTextComponent,
    CommonModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatListModule,
    TimeSlotToTimePipe,
  ],
})
export class CustomerListItemComponent {
  @Input() customer: Customer.Response;
}
