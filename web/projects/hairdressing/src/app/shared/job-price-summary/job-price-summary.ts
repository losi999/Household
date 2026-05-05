import { Component, computed, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MinutesToHourPipe } from '@hairdressing/app/pipes/minutes-to-hour-pipe';
import { Customer } from '@household/shared/types/types';

@Component({
  selector: 'hairdressing-job-price-summary',
  imports: [
    MinutesToHourPipe,  
    MatDividerModule,
  ],
  templateUrl: './job-price-summary.html',
  styleUrl: './job-price-summary.scss',
})
export class JobPriceSummary {
  prices = input<Customer.Job.Response['prices']>();
  
  total = computed<number>(() => {
    return this.prices().reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount * (currentValue.priceId ? currentValue.quantity : 1);
    }, 0);
  });
}
