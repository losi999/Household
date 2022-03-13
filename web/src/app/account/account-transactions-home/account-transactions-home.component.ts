import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';

@Component({
  selector: 'app-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss']
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.IdType;
  get transactions(): Observable<Transaction.Response[]> {
    return  this.accountService.accountTransactions(this.accountId);
  }

  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) { }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.accountService.listTransactionsByAccountId(this.accountId);
  }

}
