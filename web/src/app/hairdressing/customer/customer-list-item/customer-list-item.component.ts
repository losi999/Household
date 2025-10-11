import { Component, Input } from '@angular/core';
import { Customer } from '@household/shared/types/types';

@Component({
  selector: 'household-customer-list-item',
  standalone: false,  
  templateUrl: './customer-list-item.component.html',
  styleUrl: './customer-list-item.component.scss',
})
export class CustomerListItemComponent {
  @Input() customer: Customer.Response;

}
