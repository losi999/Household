import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';

@Injectable({
  providedIn: 'root',
})
export class AccountTransactionListResolver implements Resolve<Transaction.Response[]> {
  constructor(private accountService: AccountService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Transaction.Response[]> {
    return this.accountService.listTransactionsByAccountId(route.paramMap.get('accountId') as Account.IdType);
  }
}
