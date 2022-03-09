import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-split-transaction-list-item',
  templateUrl: './account-split-transaction-list-item.component.html',
  styleUrls: ['./account-split-transaction-list-item.component.scss']
})
export class AccountSplitTransactionListItemComponent implements OnInit {
  @Input() transaction: Transaction.SplitResponse;
  date: Date;

  constructor() { }

  ngOnInit(): void {
    this.date = new Date(this.transaction.issuedAt);
  }

}
