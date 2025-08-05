import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-invoice',
  standalone: false,  
  templateUrl: './transaction-details-invoice.component.html',
  styleUrl: './transaction-details-invoice.component.scss',
})
export class TransactionDetailsInvoiceComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponseItem | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;
}
