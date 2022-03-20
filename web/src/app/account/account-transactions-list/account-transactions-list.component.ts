import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-transactions-list',
  templateUrl: './account-transactions-list.component.html',
  styleUrls: ['./account-transactions-list.component.scss']
})
export class AccountTransactionsListComponent implements OnInit {
  @Input() transactions: Transaction.Response[];

  constructor() { }

  ngOnInit(): void {
  }

}
