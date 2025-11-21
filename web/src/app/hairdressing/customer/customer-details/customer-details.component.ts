import { AsyncPipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Calendar, Customer } from '@household/shared/types/types';
import { CustomerDetailsJobItemComponent } from '@household/web/app/hairdressing/customer/customer-details-job-item/customer-details-job-item.component';
import { CustomerDetailsWorksComponent } from '@household/web/app/hairdressing/customer/customer-details-works/customer-details-works.component';
import { PastEntriesPipe } from '@household/web/app/hairdressing/customer/pipes/past-entries.pipe';
import { UpcomingEntriesPipe } from '@household/web/app/hairdressing/customer/pipes/upcoming-entries.pipe';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerById, selectCustomerWorks } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  imports: [
    ToolbarComponent,
    MatIconModule,
    MatButtonModule,
    NgClass,
    AsyncPipe,
    CustomerDetailsWorksComponent,
    CustomerDetailsJobItemComponent,
    UpcomingEntriesPipe,
    PastEntriesPipe,
    IconTextComponent,
    MatDividerModule,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  customer: Observable<Customer.Response>;
  workEntries: Observable<Calendar.Entry.WorkEntryResponseBase[]>;
  customerId: Customer.Id;

  constructor (private store: Store, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.customerId = this.activatedRoute.snapshot.paramMap.get('customerId') as Customer.Id;

    this.customer = this.store.select(selectCustomerById(this.customerId));
    this.workEntries = this.store.select(selectCustomerWorks(this.customerId));

    this.store.dispatch(customerApiActions.listCustomersInitiated());
    this.store.dispatch(customerApiActions.listCustomerWorksInitiated({
      customerId: this.customerId,
    }));
    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  onEdit() {
    this.store.dispatch(customerActions.updateCustomer({
      customerId: this.customerId,
    }));
  }

  onCreateJob() {
    this.store.dispatch(customerActions.createCustomerJob({
      customerId: this.customerId,
    }));
  }

  onAddToBlacklist() {
    this.store.dispatch(customerActions.addCustomerToBlacklist({
      customerId: this.customerId,
    }));
  }

  onRemoveFromBlacklist(customer: Customer.Response) {
    this.store.dispatch(customerActions.deleteCustomerFromBlacklist({
      customerId: this.customerId,
      selectedCustomer: customer,
    }));
  }

}
