import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() edit = new EventEmitter<Customer.Job>();

  constructor(private store: Store, private activatedRoute: ActivatedRoute) { }

  onEdit() {
    this.edit.emit(this.job);
  }

  onDelete() {
    this.store.dispatch(dialogActions.deleteCustomerJob({
      customerId: this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id,
      name: this.job.name,
    }));
  }
}
