import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-project',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-project.component.html',
  styleUrl: './transaction-details-project.component.scss',
})
export class TransactionDetailsProjectComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponseItem | Transaction.Report;
}
