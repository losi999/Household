import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Transaction } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private httpClient: HttpClient) { }

  listAccounts(): Observable<Account.Response[]> {
    return this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`);
  }

  listTransactionsByAccouuntId(accountId: Account.IdType): Observable<Transaction.Response[]> {
    return this.httpClient.get<Transaction.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}/transactions`);
  }
}
