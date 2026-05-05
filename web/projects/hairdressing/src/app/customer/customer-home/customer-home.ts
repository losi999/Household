import { Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { customerActions, customerApiActions } from '@hairdressing/state/customer/customer.actions';
import { selectCustomerList } from '@hairdressing/state/customer/customer.selector';
import { ClearableInput } from '@household/shared-ui';
import { CustomerList } from '../customer-list/customer-list';

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
export class CustomerHome implements OnInit {
  private store = inject(Store);

  showArchivedCustomers = signal(false);
  searchValue = model<string>('');
  private customers = this.store.selectSignal(selectCustomerList);

  filteredCustomers = computed(() => {
    return this.customers().filter((c) => {
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

  ngOnInit(): void {
    this.store.dispatch(customerApiActions.listCustomersInitiated());
  }

  onCreate() {
    this.store.dispatch(customerActions.createCustomer());
  }

}
