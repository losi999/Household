import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Account } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';
import { Store } from 'src/app/store';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private refreshList: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient, private store: Store) {
    this.refreshList.subscribe({
      next: () => {
        this.listAccounts();
      },
    });
  }

  listAccounts_(): Observable<Account.Response[]> {
    return this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`);
  }

  listAccounts(): void {
    this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`).subscribe({
      next: (value) => {
        this.store.accounts.next(value);
      },
    });
  }

  createAccount(body: Account.Request): void {
    this.httpClient.post<Account.AccountId>(`${environment.apiUrl}${environment.accountStage}v1/accounts`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getAccountById(accountId: Account.Id): void {
    this.httpClient.get<Account.Response>(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`).subscribe({
      next: (value) => {
        this.store.account.next(value);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateAccount(accountId: Account.Id, body: Account.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteAccount(accountId: Account.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
