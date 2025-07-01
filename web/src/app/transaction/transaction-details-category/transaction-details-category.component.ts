import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-category',
  standalone: false,  
  templateUrl: './transaction-details-category.component.html',
  styleUrl: './transaction-details-category.component.scss',
})
export class TransactionDetailsCategoryComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponseItem;
}
