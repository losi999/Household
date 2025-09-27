import { Component, Input } from '@angular/core';
import { Customer } from '@household/shared/types/types';

@Component({
  selector: 'household-customer-list',
  standalone: false,  
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent {
  @Input() customers: Customer.Response[];
}
