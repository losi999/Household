import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { TransactionService } from 'src/app/transaction/transaction.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionResolver implements Resolve<Transaction.Response> {
  constructor(private transactionService: TransactionService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Transaction.Response> {
    return this.transactionService.getTransactionById(route.paramMap.get('transactionId') as Transaction.IdType, route.paramMap.get('accountId') as Account.IdType)
  }
}
