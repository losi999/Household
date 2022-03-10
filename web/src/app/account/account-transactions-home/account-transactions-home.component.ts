import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss']
})
export class AccountTransactionsHomeComponent implements OnInit {
  transactions: Transaction.Response[];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.transactions = this.activatedRoute.snapshot.data.transactions;
  }

}
