import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class CustomerDetailsJobItemComponent implements OnInit {
  @Input() job: Customer.Job.Response;
  @Output() edit = new EventEmitter<Customer.Job.Response>();
  total: number;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.total = this.job.prices.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount * (currentValue.quantity ?? 1);
    }, 0);
  }

  onEdit() {
    this.edit.emit(this.job);
  }

  onDelete() {
    this.store.dispatch(dialogActions.deleteCustomerJob({
      customerId: this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id,
      name: this.job.name,
    }));
  }

  onAddEntry() {
    console.log(this.job);
  }
}
