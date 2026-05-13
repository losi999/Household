import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CustomerListItem } from '@hairdressing/app/customer/customer-list-item/customer-list-item';
import { Searchable } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

@Component({
  selector: 'hairdressing-customer-list',
  imports: [
    MatListModule,
    CustomerListItem,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
})
export class CustomerList {
  customers = input.required<Searchable<Customer.Response>[]>();

}
