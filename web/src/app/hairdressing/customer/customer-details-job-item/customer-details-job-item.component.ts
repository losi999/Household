import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { customerActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-customer-details-job-item',
  standalone: false,  
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
