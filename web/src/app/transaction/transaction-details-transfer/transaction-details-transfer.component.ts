import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';

@Component({
  selector: 'household-transaction-details-transfer',
  imports: [TransactionDetailsRowComponent],  
  templateUrl: './transaction-details-transfer.component.html',
  styleUrl: './transaction-details-transfer.component.scss',
})
export class TransactionDetailsTransferComponent {
  @Input() transaction: Transaction.TransferResponse;
  @Input() twoWayDisplay: boolean;
}
