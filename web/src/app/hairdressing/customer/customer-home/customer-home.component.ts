import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Customer } from '@household/shared/types/types';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerList } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
    CommonModule,
    AutocompleteFilterPipe,
    MatButtonModule,
  ],
})
export class CustomerHomeComponent implements OnInit {
  customers: Observable<Customer.Response[]>;

  search: FormControl<string>;
  
  constructor(private store: Store) { }

  ngOnInit(): void {
    this.search = new FormControl();

    this.customers = this.store.select(selectCustomerList);

    this.store.dispatch(customerApiActions.listCustomersInitiated());
  }

  onCreate() {
    this.store.dispatch(customerActions.createCustomer());
  }
}
