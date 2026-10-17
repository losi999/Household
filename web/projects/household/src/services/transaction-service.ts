import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

@Service()
export class TransactionService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listTransactionsByAccount(accountId: Api.Account.Id, { pageNumber, pageSize }: Api.Pagination<number>) {
    return this.httpClient.get<Responses.Transaction[]>(`${this.apiUrl}/transaction/v1/accounts/${accountId}/transactions`, {
      params: {
        pageNumber,
        pageSize,
      },
    });
  }
}
