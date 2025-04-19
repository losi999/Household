import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecipientService {

  constructor(private httpClient: HttpClient) { }

  listRecipients() {
    return this.httpClient.get<Recipient.Response[]>(`${environment.apiUrl}/recipient/v1/recipients`);
  }

  createRecipient(body: Recipient.Request) {
    return this.httpClient.post<Recipient.RecipientId>(`${environment.apiUrl}/recipient/v1/recipients`, body);
  }

  updateRecipient(recipientId: Recipient.Id, body: Recipient.Request) {
    return this.httpClient.put<Recipient.RecipientId>(`${environment.apiUrl}/recipient/v1/recipients/${recipientId}`, body);
  }

  deleteRecipient(recipientId: Recipient.Id) {
    return this.httpClient.delete(`${environment.apiUrl}/recipient/v1/recipients/${recipientId}`);
  }

  mergeRecipients(recipientId: Recipient.Id, body: Recipient.Id[]) {
    return this.httpClient.post(`${environment.apiUrl}/recipient/v1/recipients/${recipientId}/merge`, body);
  }

}
