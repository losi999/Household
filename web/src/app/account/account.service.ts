import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Account } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

type AccountCreated = {
  action: 'created';
  accountId: Account.Id;
  request: Account.Request;
};

type AccountUpdated = {
  action: 'updated';
  accountId: Account.Id;
  request: Account.Request;
};

type AccountDeleted = {
  action: 'deleted';
  accountId: Account.Id;
};
type AccountEvent = AccountCreated | AccountUpdated | AccountDeleted;

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private _collectionUpdated: Subject<AccountEvent> = new Subject();

  get collectionUpdated(): Observable<AccountEvent> {
    return this._collectionUpdated.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listAccounts(): Observable<Account.Response[]> {
    return this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`);
  }

  createAccount(body: Account.Request): void {
    this.httpClient.post<Account.AccountId>(`${environment.apiUrl}${environment.accountStage}v1/accounts`, body).subscribe({
      next: (value) => {
        this._collectionUpdated.next({
          action: 'created',
          accountId: value.accountId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateAccount(accountId: Account.Id, body: Account.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'updated',
          accountId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteAccount(accountId: Account.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'deleted',
          accountId,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
