import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-customer-details-job-item',
  standalone: false,  
  templateUrl: './customer-details-job-item.component.html',
  styleUrl: './customer-details-job-item.component.scss',
})
export class CustomerDetailsJobItemComponent {
  @Input() job: Customer.Job;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) { }

  edit() {
    this.store.dispatch(dialogActions.updateCustomerJob({
      customerId: this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id,
      ...this.job,
    }));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteCustomerJob({
      customerId: this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id,
      name: this.job.name,
    }));
  }
}
