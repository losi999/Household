import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-project',
  standalone: false,
  
  templateUrl: './transaction-details-project.component.html',
  styleUrl: './transaction-details-project.component.scss',
})
export class TransactionDetailsProjectComponent {
  @Input() transaction: Transaction.PaymentResponse | Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponseItem | Transaction.Report;
}
