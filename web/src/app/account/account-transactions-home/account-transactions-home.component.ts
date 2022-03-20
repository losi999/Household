import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { AccountService } from 'src/app/account/account.service';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss']
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.IdType;
  transactions: Transaction.Response[]
  private pageNumber: number;

  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) {
  }

  ngOnInit(): void {
    this.pageNumber = 1;

    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.transactions = this.activatedRoute.snapshot.data.transactions;
  }

  loadMore() {
    this.pageNumber += 1;

    this.accountService.listTransactionsByAccountId(this.accountId, this.pageNumber).subscribe((response) => {
      this.transactions.push(...response);
    })
  }
}
