import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { skip } from 'rxjs/operators';
import { TransactionService } from 'src/app/transaction/transaction.service';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss'],
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.Id;
  transactions: Transaction.Response[];

  constructor(private activatedRoute: ActivatedRoute, private transactionService: TransactionService, private router: Router) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(skip(1)).subscribe((value) => {
      this.transactionService.listTransactionsByAccountId(this.accountId, Number(value.page)).subscribe((response) => {
        this.transactions.push(...response);
      });
    });

    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactions = this.activatedRoute.snapshot.data.transactions;
  }

  loadMore() {

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { page: Number(this.activatedRoute.snapshot.queryParams.page ?? 1) + 1 },
        queryParamsHandling: 'merge',
        replaceUrl: true
      }
    );

  }
}
