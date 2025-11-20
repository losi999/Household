import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { Customer } from '@household/shared/types/types';

@Component({
  selector: 'household-customer-list-item',
  templateUrl: './customer-list-item.component.html',
  styleUrl: './customer-list-item.component.scss',
  imports: [
    CommonModule,
    MatListModule,
    RouterLink,
  ],
})
export class CustomerListItemComponent {
  @Input() customer: Customer.Response;
}
