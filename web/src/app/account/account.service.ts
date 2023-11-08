import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Account } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private _refreshList: Subject<void> = new Subject();

  get refreshList(): Observable<void> {
    return this._refreshList.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listAccounts(): Observable<Account.Response[]> {
    return this.httpClient.get<Account.Response[]>(`${environment.apiUrl}${environment.accountStage}v1/accounts`);
  }

  createAccount(body: Account.Request): void {
    this.httpClient.post(`${environment.apiUrl}${environment.accountStage}v1/accounts`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateAccount(accountId: Account.Id, body: Account.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteAccount(accountId: Account.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.accountStage}v1/accounts/${accountId}`).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
