import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-inventory',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-inventory.component.html',
  styleUrl: './transaction-details-inventory.component.scss',
})
export class TransactionDetailsInventoryComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponseItem | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;
}
