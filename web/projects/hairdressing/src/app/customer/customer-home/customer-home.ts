import { Component, computed, inject, model, signal } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClearableInput } from '@household/shared-ui';
import { CustomerList } from '../customer-list/customer-list';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { injectDispatch } from '@ngrx/signals/events';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';

@Component({
  selector: 'hairdressing-customer-home',
  imports: [
    Toolbar,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ClearableInput,
    CustomerList,
  ],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.scss',
})
export class CustomerHome {
  readonly customerStore = inject(CustomerStore);
  private customerApiEvents = injectDispatch(customerApiEvents);
  private customerEvents = injectDispatch(customerEvents);

  showArchivedCustomers = signal(false);

  searchValue = model<string>('');

  filteredCustomers = computed(() => {
    return this.customerStore.customerList().filter((c) => {
      if (c.isArchived && !this.showArchivedCustomers()) {
        return false;
      }

      if (!this.searchValue()) {
        return true;
      }

      const terms = this.searchValue().toLowerCase()
        .split(' ');
       
      return c.searchTerms?.some(s => terms.every(t => s.includes(t)));
    });
  });

  constructor() {
    this.customerApiEvents.listCustomersInitiated();
  }

  onCreate() {
    this.customerEvents.createCustomer();
  }

}
