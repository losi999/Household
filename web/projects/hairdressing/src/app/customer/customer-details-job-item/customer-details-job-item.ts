import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { Customer } from '@household/shared/types/types';
import { JobPriceSummary } from '@hairdressing/app/shared/job-price-summary/job-price-summary';
import { injectDispatch } from '@ngrx/signals/events';
import { customerEvents } from '@hairdressing/state/customer/customer-events';

@Component({
  selector: 'hairdressing-customer-details-job-item',
  imports: [
    MatCardModule,
    RouterLink,
    TimeSlotToTimePipe,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    JobPriceSummary,
  ],
  templateUrl: './customer-details-job-item.html',
  styleUrl: './customer-details-job-item.scss',
})
export class CustomerDetailsJobItem {
  private customerEvents = injectDispatch(customerEvents);
  private activatedRoute = inject(ActivatedRoute);
  
  customerId: Customer.Id = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;
  job = input.required<Customer.Job.Response>();

  onEdit() {
    this.customerEvents.updateCustomerJob({
      customerId: this.customerId,
      ...this.job(),
    });
  }

  onDelete() {
    this.customerEvents.deleteCustomerJob({
      customerId: this.customerId,
      name: this.job().name,
    });
  }

}
