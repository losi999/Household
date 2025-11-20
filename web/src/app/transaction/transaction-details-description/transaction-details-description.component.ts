import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-description',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-description.component.html',
  styleUrl: './transaction-details-description.component.scss',
})
export class TransactionDetailsDescriptionComponent {
  @Input() transaction: Transaction.Response | Transaction.Report;
}
