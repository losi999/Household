import { Component, computed, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { filterSearchable } from '@household/shared/common/utils';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerList } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs';

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
    MatSlideToggleModule,
    FormsModule,
  ],
})
export class CustomerHomeComponent implements OnInit {
  showArchivedCustomers = signal(false);
  customers = toSignal(toObservable(this.showArchivedCustomers).pipe(
    switchMap(showArchived => this.store.select(selectCustomerList(showArchived))),
  ));

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
