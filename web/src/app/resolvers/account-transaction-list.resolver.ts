import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { transactionsPageSize } from 'src/app/constants';
import { TransactionService } from 'src/app/transaction/transaction.service';

@Injectable({
  providedIn: 'root',
})
export class AccountTransactionListResolver implements Resolve<Transaction.Response[]> {
  constructor(private transactionService: TransactionService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Transaction.Response[]> {
    return this.transactionService.listTransactionsByAccountId(route.paramMap.get('accountId') as Account.Id, 1, (route.queryParams.page ?? 1) * transactionsPageSize);
  }
}
