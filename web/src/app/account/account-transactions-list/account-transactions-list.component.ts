import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-account-transactions-list',
  templateUrl: './account-transactions-list.component.html',
  styleUrls: ['./account-transactions-list.component.scss'],
  standalone: false,
})
export class AccountTransactionsListComponent {
  @Input() transactions: Transaction.Response[];

  constructor() {
  }
}
