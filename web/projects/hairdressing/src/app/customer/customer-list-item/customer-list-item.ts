import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { Customer } from '@household/shared/types/types';
import { IconText } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { customerEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';

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
  private customerEvents = injectDispatch(customerEvents);
  readonly customerStore = inject(CustomerStore);

  isDisabled = computed(() => {
    return this.customerStore.isInProgress().includes(this.customer().customerId);
  });

  onDelete() {
    this.customerEvents.deleteCustomer(this.customer());
  }

}
