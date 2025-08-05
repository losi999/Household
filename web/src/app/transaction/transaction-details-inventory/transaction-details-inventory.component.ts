import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-inventory',
  standalone: false,  
  templateUrl: './transaction-details-inventory.component.html',
  styleUrl: './transaction-details-inventory.component.scss',
})
export class TransactionDetailsInventoryComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponseItem | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;
}
