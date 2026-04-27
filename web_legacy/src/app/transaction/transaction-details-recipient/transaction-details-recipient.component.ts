import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-recipient',
  standalone: false,  
  templateUrl: './transaction-details-recipient.component.html',
  styleUrl: './transaction-details-recipient.component.scss',
})
export class TransactionDetailsRecipientComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;  
}
