import { Component, computed, effect, inject, Signal } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Customer } from '@household/shared/types/types';
import { customerActions, customerApiActions } from '@hairdressing/state/customer/customer.actions';
import { priceApiActions } from '@hairdressing/state/price/price-actions';
import { selectCustomerById, selectCustomerWorks } from '@hairdressing/state/customer/customer.selector';
import { MatDividerModule } from '@angular/material/divider';
import { IconText } from '@household/shared-ui';
import { CustomerDetailsWorks } from '@hairdressing/app/customer/customer-details-works/customer-details-works';
import { CustomerDetailsJobItem } from '@hairdressing/app/customer/customer-details-job-item/customer-details-job-item';

@Component({
  selector: 'hairdressing-customer-details',
  imports: [
    Toolbar,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    IconText,
    CustomerDetailsWorks,
    CustomerDetailsJobItem,
  ],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss',
})
export class CustomerDetails {
  private activatedRoute = inject(ActivatedRoute);
  private store = inject(Store);

  customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;

  customer = this.store.selectSignal(selectCustomerById(this.customerId));
  workEntries = this.store.selectSignal(selectCustomerWorks(this.customerId));

  upcomingEntries = computed(() => {
    const now = new Date().toISOString();
    return this.workEntries()?.filter(e => {
      return e.day > now;
    })
      .toReversed() ?? [];      
  });

  pastEntries = computed(() => {
    const now = new Date().toISOString();

    return this.workEntries()?.filter(e => {
      return e.day < now;
    }) ?? [];
  });

  constructor() {
    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(priceApiActions.listPricesInitiated());    
    this.store.dispatch(customerApiActions.listCustomerWorksInitiated({
      customerId: this.customerId,
    }));

  }

  onEdit() {
    this.store.dispatch(customerActions.updateCustomer({
      customerId: this.customer().customerId,
    }));
  }

  onCreateJob() {
    this.store.dispatch(customerActions.createCustomerJob({
      customerId: this.customerId,
    }));
  }

  onAddToBlacklist() {
    // this.store.dispatch(customerActions.addCustomerToBlacklist({
    //   customerId: this.customer().customerId,
    // }));
  }

  onRemoveFromBlacklist(customer: Customer.ResponseBase) {
    this.store.dispatch(customerActions.deleteCustomerFromBlacklist({
      customerId: this.customer().customerId,
      selectedCustomer: customer,
    }));
  }

}
