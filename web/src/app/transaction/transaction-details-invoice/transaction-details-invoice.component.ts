import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-invoice',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-invoice.component.html',
  styleUrl: './transaction-details-invoice.component.scss',
})
export class TransactionDetailsInvoiceComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.SplitResponseItem | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.Report;
}
