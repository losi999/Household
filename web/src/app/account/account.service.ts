import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Account, Transaction } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private _accounts = new BehaviorSubject<Account.Response[]>([]);
  private _accountTransactions: { [accountId: string]: BehaviorSubject<Transaction.Response[]> } = {};

  get accounts() {
    return this._accounts.asObservable();
  }

  accountTransactions(accountId: Account.IdType): Observable<Transaction.Response[]> {
    if (!this._accountTransactions[accountId]) {
      this._accountTransactions[accountId] = new BehaviorSubject([]);
    }

    return this._accountTransactions[accountId].asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listAccounts(): void {
    this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`)
      .subscribe(accounts => this._accounts.next(accounts));
  }

  listTransactionsByAccountId(accountId: Account.IdType): void {
    this.httpClient.get<Transaction.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}/transactions`)
      .subscribe((transactions) => {
        if (!this._accountTransactions[accountId]) {
          this._accountTransactions[accountId] = new BehaviorSubject(transactions);
        } else {
          this._accountTransactions[accountId].next(transactions);
        }
      });
  }
}
