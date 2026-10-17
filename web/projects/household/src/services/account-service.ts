import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Observable, of } from 'rxjs';

@Service()
export class AccountService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listAccounts() {
    return this.httpClient.get<Responses.Account[]>(`${this.apiUrl}/account/v1/accounts`);
  }

  createAccount(body: Requests.Account) {
    return this.httpClient.post<Api.Account.AccountId>(`${this.apiUrl}/account/v1/accounts`, body);
  }

  updateAccount(accountId: Api.Account.Id, body: Requests.Account) {
    return this.httpClient.put<void>(`${this.apiUrl}/account/v1/accounts/${accountId}`, body);
  }

  deleteAccount(accountId: Api.Account.Id) {
    return this.httpClient.delete<void>(`${this.apiUrl}/account/v1/accounts/${accountId}`);
  }

  // The API cannot open and close an account yet, so these methods simulate a successful call without sending any request
  /* eslint-disable @typescript-eslint/no-unused-vars */
  openAccount(accountId: Api.Account.Id): Observable<void> {
    return of(undefined);
  }

  closeAccount(accountId: Api.Account.Id): Observable<void> {
    return of(undefined);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
