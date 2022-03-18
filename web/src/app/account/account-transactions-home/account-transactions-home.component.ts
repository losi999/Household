import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss']
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.IdType;
  transactions: Transaction.Response[]

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.transactions = this.activatedRoute.snapshot.data.transactions;
  }

}
