import { Component, Input, OnInit } from '@angular/core';
import { Account, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-account-transactions-list-item',
  templateUrl: './account-transactions-list-item.component.html',
  styleUrls: ['./account-transactions-list-item.component.scss'],
})
export class AccountTransactionsListItemComponent implements OnInit {
  @Input() transaction: Transaction.Response;
  date: Date;
  iconName: string;
  iconColor: string;
  account: Account.Response;
  showYear: boolean;

  constructor() { }

  ngOnInit(): void {
    this.date = new Date(this.transaction.issuedAt);
    this.showYear = this.date.getFullYear() !== (new Date()).getFullYear();

    switch (this.transaction.transactionType) {
      case 'loanTransfer':
      case 'transfer': {
        this.iconName = 'sync_alt';
        this.iconColor = 'blue';
        this.account = this.transaction.account;
        break;
      }
      case 'payment': {
        this.iconName = this.transaction.amount >= 0 ? 'arrow_upward' : 'arrow_downward';
        this.iconColor = this.transaction.amount >= 0 ? 'green' : 'red';
        this.account = this.transaction.account;
        break;
      }
      case 'split': {
        this.iconName = this.transaction.amount >= 0 ? 'arrow_upward' : 'arrow_downward';
        this.iconColor = this.transaction.amount >= 0 ? 'green' : 'red';
        this.account = this.transaction.account;
      } break;
      case 'deferred': {
        this.iconName = 'forward';
        this.iconColor = this.transaction.amount >= 0 ? 'green' : 'red';
      } break;
      case 'reimbursement': {
        this.iconName = 'reply_all';
        this.iconColor = this.transaction.amount >= 0 ? 'green' : 'red';
      } break;
    }
  }

}
