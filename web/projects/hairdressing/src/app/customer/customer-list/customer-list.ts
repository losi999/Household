import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CustomerListItem } from '@hairdressing/app/customer/customer-list-item/customer-list-item';
import { Searchable } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';

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
  customers = input.required<Searchable<Responses.Customer>[]>();

}
