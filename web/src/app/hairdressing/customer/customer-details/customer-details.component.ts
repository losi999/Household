import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerById } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
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

    this.customer = this.store.select(selectCustomerById(this.customerId));

    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  onEdit() {
    this.store.dispatch(dialogActions.updateCustomer({
      customerId: this.customerId,
    }));
  }

  onCreateJob() {
    this.store.dispatch(dialogActions.createCustomerJob({
      customerId: this.customerId,
    }));
  }

  onAddToBlacklist() {
    this.store.dispatch(dialogActions.addCustomerToBlacklist({
      customerId: this.customerId,
    }));
  }

  onRemoveFromBlacklist(customer: Customer.Response) {
    this.store.dispatch(dialogActions.deleteCustomerFromBlacklist({
      customerId: this.customerId,
      selectedCustomer: customer,
    }));
  }

}
