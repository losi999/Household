import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { customerActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';
import { Store } from '@ngrx/store';

@Component({
  imports: [
    TimeSlotToTimePipe,
    JobPriceSummaryComponent,
    RouterLink,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'household-customer-details-job-item',
  templateUrl: './customer-details-job-item.component.html',
  styleUrl: './customer-details-job-item.component.scss',
})
export class CustomerDetailsJobItemComponent implements OnInit {
  @Input() job: Customer.Job.Response;
  customerId: Customer.Id;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;
  }

  onEdit() {
    this.store.dispatch(customerActions.updateCustomerJob({
      customerId: this.customerId,
      ...this.job,
    }));
  }

  onDelete() {
    this.store.dispatch(customerActions.deleteCustomerJob({
      customerId: this.customerId,
      name: this.job.name,
    }));
  }
}
