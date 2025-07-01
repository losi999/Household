import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-transfer',
  standalone: false,  
  templateUrl: './transaction-details-transfer.component.html',
  styleUrl: './transaction-details-transfer.component.scss',
})
export class TransactionDetailsTransferComponent {
  @Input() transaction: Transaction.TransferResponse;
}
