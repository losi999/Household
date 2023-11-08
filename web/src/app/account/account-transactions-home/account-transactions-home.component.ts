import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { TransactionService } from 'src/app/transaction/transaction.service';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss'],
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.Id;
  transactions: Transaction.Response[];
  private pageNumber: number;

  constructor(private activatedRoute: ActivatedRoute, private transactionService: TransactionService) {
  }

  ngOnInit(): void {
    this.pageNumber = 1;

    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactions = this.activatedRoute.snapshot.data.transactions;
  }

  loadMore() {
    this.pageNumber += 1;

    this.transactionService.listTransactionsByAccountId(this.accountId, this.pageNumber).subscribe((response) => {
      this.transactions.push(...response);
    });
  }
}
