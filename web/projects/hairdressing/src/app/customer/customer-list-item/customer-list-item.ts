import { Component, effect, inject, input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { selectCustomerIsInProgress } from '@hairdressing/state/customer/customer.selector';
import { Customer } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { IconText } from '@household/shared-ui';
import { customerActions } from '@hairdressing/state/customer/customer.actions';

@Component({
  selector: 'hairdressing-customer-list-item',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatListModule,
    TimeSlotToTimePipe,
    IconText,
  ],
  templateUrl: './customer-list-item.html',
  styleUrl: './customer-list-item.scss',
})
export class CustomerListItem {
  customer = input.required<Customer.Response>();
  private store = inject(Store);

  isDisabled: Signal<boolean>;

  constructor() {
    effect(() => {
      this.isDisabled = this.store.selectSignal(selectCustomerIsInProgress(this.customer().customerId));
    });
  }

  onDelete() {
    this.store.dispatch(customerActions.deleteCustomer(this.customer()));
  }

}
