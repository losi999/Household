import { Component, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filterSearchable } from '@household/shared/common/utils';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerList } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrl: './customer-home.component.scss',
  imports: [
    ReactiveFormsModule,
    CustomerListComponent,
    ClearableInputComponent,
    MatIconModule,
    ToolbarComponent,
    MatButtonModule,
  ],
})
export class CustomerHomeComponent implements OnInit {
  customers = toSignal(this.store.select(selectCustomerList));

  search = new FormControl<string>('');
  searchValue = toSignal(this.search.valueChanges);

  filteredCustomers = computed(() => {
    if (!this.searchValue()) {
      return this.customers();
    }

    return filterSearchable(this.customers(), this.searchValue());
  });

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(customerApiActions.listCustomersInitiated());
  }

  onCreate() {
    this.store.dispatch(customerActions.createCustomer());
  }
}
