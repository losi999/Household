import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private httpClient: HttpClient) {

  }

  listAccounts(): Observable<Account.Response[]> {
    return this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`);
  }

  createAccount(body: Account.Request) {
    return this.httpClient.post<Account.AccountId>(`${environment.apiUrl}${environment.accountStage}v1/accounts`, body);
  }

  getAccountById(accountId: Account.Id) {
    return this.httpClient.get<Account.Response>(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`);
  }

  updateAccount(accountId: Account.Id, body: Account.Request) {
    return this.httpClient.put<Account.AccountId>(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`, body);
  }

  deleteAccount(accountId: Account.Id) {
    return this.httpClient.delete(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`);
  }
}
