import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Calendar, Customer } from '@household/shared/types/types';
import { CustomerDetailsJobItemComponent } from '@household/web/app/hairdressing/customer/customer-details-job-item/customer-details-job-item.component';
import { CustomerDetailsWorksComponent } from '@household/web/app/hairdressing/customer/customer-details-works/customer-details-works.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerById, selectCustomerWorks } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';

@Component({
  imports: [
    ToolbarComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    CustomerDetailsWorksComponent,
    CustomerDetailsJobItemComponent,
    IconTextComponent,
    MatDividerModule,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  customer: Signal<Customer.Response>;
  workEntries: Signal<Calendar.Entry.WorkEntryResponseBase[]>;
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

  constructor (private store: Store, private activatedRoute: ActivatedRoute) {
    const customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;
    this.customer = toSignal(this.store.select(selectCustomerById(customerId)));
    this.workEntries = toSignal(this.store.select(selectCustomerWorks(customerId)));
    
    effect(() => {
      if (this.customer()) {
        this.store.dispatch(customerApiActions.listCustomerWorksInitiated({
          customerId: this.customer().customerId,
        }));
      }
    });
  }
  
  ngOnInit(): void {
    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  onEdit() {
    this.store.dispatch(customerActions.updateCustomer({
      customerId: this.customer().customerId,
    }));
  }

  onCreateJob() {
    const { customerId } = this.customer();
    this.store.dispatch(customerActions.createCustomerJob({
      customerId,
    }));
  }

  onAddToBlacklist() {
    this.store.dispatch(customerActions.addCustomerToBlacklist({
      customerId: this.customer().customerId,
    }));
  }

  onRemoveFromBlacklist(customer: Customer.Response) {
    this.store.dispatch(customerActions.deleteCustomerFromBlacklist({
      customerId: this.customer().customerId,
      selectedCustomer: customer,
    }));
  }

}
