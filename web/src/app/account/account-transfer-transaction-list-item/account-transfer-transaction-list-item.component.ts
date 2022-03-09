import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-transfer-transaction-list-item',
  templateUrl: './account-transfer-transaction-list-item.component.html',
  styleUrls: ['./account-transfer-transaction-list-item.component.scss']
})
export class AccountTransferTransactionListItemComponent implements OnInit {
  @Input() transaction: Transaction.TransferResponse;
  date: Date;

  constructor() { }

  ngOnInit(): void {
    this.date = new Date(this.transaction.issuedAt);
  }

}
