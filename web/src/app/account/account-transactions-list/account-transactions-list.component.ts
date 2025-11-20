import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { AccountTransactionsListItemComponent } from '@household/web/app/account/account-transactions-list-item/account-transactions-list-item.component';

@Component({
  selector: 'household-account-transactions-list',
  templateUrl: './account-transactions-list.component.html',
  styleUrls: ['./account-transactions-list.component.scss'],
  imports: [AccountTransactionsListItemComponent],
})
export class AccountTransactionsListComponent {
  @Input() transactions: Transaction.Response[];

  constructor() {
  }
}
