import { Component, OnInit } from '@angular/core';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { selectCustomerList } from '@household/web/state/customer/customer.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-customer-home',
  standalone: false,  
  templateUrl: './customer-home.component.html',
  styleUrl: './customer-home.component.scss',
})
export class CustomerHomeComponent implements OnInit {
  customers: Observable<Customer.Response[]>;
  
  constructor(private store: Store) { }

  ngOnInit(): void {
    this.customers = this.store.select(selectCustomerList);

    this.store.dispatch(customerApiActions.listCustomersInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createCustomer());
  }
}
