import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { selectCustomer } from '@household/web/state/customer/customer.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-customer-details',
  standalone: false,  
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  customer: Observable<Customer.Response>;
  customerId: Customer.Id;

  constructor (private store: Store, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;

    this.customer = this.store.select(selectCustomer);

    this.store.dispatch(customerApiActions.getCustomerByIdInitiated({
      customerId: this.customerId,
    }));
  }

  addJob() {
    this.store.dispatch(dialogActions.createCustomerJob({
      customerId: this.customerId,
    }));
  }

  edit() {
    this.store.dispatch(dialogActions.updateCustomer());
  }

}
