import { Component, computed, inject } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '@household/shared/types/types';
import { MatDividerModule } from '@angular/material/divider';
import { IconText } from '@household/shared-ui';
import { CustomerDetailsWorks } from '@hairdressing/app/customer/customer-details-works/customer-details-works';
import { CustomerDetailsJobItem } from '@hairdressing/app/customer/customer-details-job-item/customer-details-job-item';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { injectDispatch } from '@ngrx/signals/events';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';

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
  private priceApiEvents = injectDispatch(priceApiEvents);
  private customerApiEvents = injectDispatch(customerApiEvents);
  private customerEvents = injectDispatch(customerEvents);
  private activatedRoute = inject(ActivatedRoute);
  private customerStore = inject(CustomerStore);

  customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;

  customer = computed(() => {
    return this.customerStore.customerList().find(c => c.customerId === this.customerId);
  });

  upcomingEntries = computed(() => {
    const now = new Date().toISOString();
    return this.customerStore.customerWorks()[this.customer().customerId]?.filter(e => {
      return e.day > now;
    })
      .toReversed() ?? [];      
  });

  pastEntries = computed(() => {
    const now = new Date().toISOString();

    return this.customerStore.customerWorks()[this.customer().customerId]?.filter(e => {
      return e.day < now;
    }) ?? [];
  });

  constructor() {
    this.customerApiEvents.listCustomersInitiated();
    this.priceApiEvents.listPricesInitiated();
    this.customerApiEvents.listCustomerWorksInitiated({
      customerId: this.customerId,
    });

  }

  onEdit() {
    this.customerEvents.updateCustomer(this.customer());
  }

  onCreateJob() {
    this.customerEvents.createCustomerJob({
      customerId: this.customerId,
    });
  }

  onAddToBlacklist() {
    this.customerEvents.addCustomerToBlacklist(this.customer());
  }

  onRemoveFromBlacklist(customer: Customer.ResponseBase) {
    this.customerEvents.deleteCustomerFromBlacklist({
      currentCustomer: this.customer(),
      selectedCustomer: customer,
    });
  }

}
