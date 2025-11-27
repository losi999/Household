import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-recipient',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-recipient.component.html',
  styleUrl: './transaction-details-recipient.component.scss',
})
export class TransactionDetailsRecipientComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;  
}
