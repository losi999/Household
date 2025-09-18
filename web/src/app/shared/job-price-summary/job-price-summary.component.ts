import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { isListedPrice } from '@household/shared/common/type-guards';
import { Customer } from '@household/shared/types/types';
import { MinutesToHourPipe } from '@household/web/app/shared/minutes-to-hour.pipe';

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
export class JobPriceSummaryComponent implements OnInit {
  @Input() prices: Customer.Job.Response['prices'];
  total: number;
  
  ngOnInit(): void {
    this.total = this.prices.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount * (isListedPrice(currentValue) ? currentValue.quantity : 1);
    }, 0);
  }
}
