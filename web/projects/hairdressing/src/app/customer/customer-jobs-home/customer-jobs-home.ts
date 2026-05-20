import { Component, inject } from '@angular/core';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { injectDispatch } from '@ngrx/signals/events';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { CustomerJobReportSort } from '@hairdressing/types';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Customer, Price } from '@household/shared/types/types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'hairdressing-customer-jobs-home',
  imports: [
    Toolbar,
    MatTableModule,
    MatSortModule,
    TimeSlotToTimePipe,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './customer-jobs-home.html',
  styleUrl: './customer-jobs-home.scss',
})
export class CustomerJobsHome {
  readonly customerStore = inject(CustomerStore);
  private customerApiEvents = injectDispatch(customerApiEvents);
  private customerEvents = injectDispatch(customerEvents);

  displayedColumns = [
    'customerName',
    'jobName',
    'duration',
    'total',
    'hourlyRate',
    'prices',
    'buttons',
  ];

  constructor() {
    this.customerApiEvents.listCustomersInitiated();
  }

  onAddPriceFilter(priceId: Price.Id) {
    this.customerEvents.addPriceFilter(priceId);
  }

  onRemovePriceFilter(priceId: Price.Id) {
    this.customerEvents.removePriceFilter(priceId);
  }

  onSortChange(event: Sort) {
    if(!event.direction) {
      this.customerEvents.sortJobs({
        sortBy: undefined,
        sortOrder: undefined,
      });
    } else {
      this.customerEvents.sortJobs({
        sortBy: event.active as CustomerJobReportSort,
        sortOrder: event.direction,
      });
    }
  }

  onEditJob(customerId: Customer.Id, jobName: string) {
    const job = this.customerStore.customerList().find(c => c.customerId === customerId)?.jobs.find(j => j.name === jobName);
    this.customerEvents.updateCustomerJob({
      customerId,
      ...job,
    });
  }

}
