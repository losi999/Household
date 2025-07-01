import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-description',
  standalone: false,  
  templateUrl: './transaction-details-description.component.html',
  styleUrl: './transaction-details-description.component.scss',
})
export class TransactionDetailsDescriptionComponent {
  @Input() transaction: Transaction.Response;
}
