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
  cost = input<Customer.Job.CostResponse>();
  
  total = computed<number>(() => {
    return this.cost().prices.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount * currentValue.quantity;
    }, 0) + (this.cost().additionalPrice ?? 0);
  });
}
