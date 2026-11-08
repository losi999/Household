import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Service()
export class RecipientService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listRecipients() {
    return this.httpClient.get<Responses.Recipient[]>(`${this.apiUrl}/recipient/v1/recipients`);
  }
  
  createRecipient(body: Requests.Recipient) {
    return this.httpClient.post<Api.Recipient.RecipientId>(`${this.apiUrl}/recipient/v1/recipients`, body);
  }
  
  updateRecipient(recipientId: Api.Recipient.Id, body: Requests.Recipient) {
    return this.httpClient.put<void>(`${this.apiUrl}/recipient/v1/recipients/${recipientId}`, body);
  }
  
  deleteRecipient(recipientId: Api.Recipient.Id) {
    return this.httpClient.delete<void>(`${this.apiUrl}/recipient/v1/recipients/${recipientId}`);
  }

  mergeRecipients(recipientId: Api.Recipient.Id, body: Api.Recipient.Id[]) {
    return this.httpClient.post<void>(`${this.apiUrl}/recipient/v1/recipients/${recipientId}/merge`, body);
  }
}
