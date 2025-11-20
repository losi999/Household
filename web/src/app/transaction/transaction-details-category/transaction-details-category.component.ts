import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-category',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-category.component.html',
  styleUrl: './transaction-details-category.component.scss',
})
export class TransactionDetailsCategoryComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponseItem | Transaction.Report;
}
