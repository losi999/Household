import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Customer } from '@household/shared/types/types';
import { MinutesToHourPipe } from '@household/web/app/shared/pipes/minutes-to-hour.pipe';

@Component({
  selector: 'household-job-price-summary',
  imports: [
    MinutesToHourPipe,
    CommonModule,
    MatDividerModule,
  ],
  templateUrl: './job-price-summary.component.html',
  styleUrl: './job-price-summary.component.scss',
})
export class JobPriceSummaryComponent {
  prices = input<Customer.Job.Response['prices']>();
  
  total = computed<number>(() => {
    return this.prices().reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount * (currentValue.priceId ? currentValue.quantity : 1);
    }, 0);
  });
}
