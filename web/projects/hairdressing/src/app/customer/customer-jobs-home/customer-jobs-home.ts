import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'hairdressing-customer-jobs-home',
  imports: [
    Toolbar,
    JsonPipe,
  ],
  templateUrl: './customer-jobs-home.html',
  styleUrl: './customer-jobs-home.scss',
})
export class CustomerJobsHome {
  readonly customerStore = inject(CustomerStore);
  private customerApiEvents = injectDispatch(customerApiEvents);

  constructor() {
    this.customerApiEvents.listCustomersInitiated();
  }

}
