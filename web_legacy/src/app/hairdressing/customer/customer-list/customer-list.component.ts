import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Customer } from '@household/shared/types/types';
import { CustomerListItemComponent } from '@household/web/app/hairdressing/customer/customer-list-item/customer-list-item.component';

@Component({
  selector: 'household-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
  imports: [
    MatListModule,
    CommonModule,
    CustomerListItemComponent,
  ],
})
export class CustomerListComponent {
  @Input() customers: Customer.Response[];
}
