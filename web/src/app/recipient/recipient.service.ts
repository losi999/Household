import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { Subject } from 'rxjs';
import { Store } from 'src/app/store';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecipientService {
  private refreshList: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient, private store: Store) {
    this.refreshList.subscribe({
      next: () => {
        this.listRecipients();
      },
    });
  }
  listRecipients(): void {
    this.httpClient.get<Recipient.Response[]>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`).subscribe({
      next: (value) => {
        this.store.recipients.next(value);
      },
    });
  }

  createRecipient(body: Recipient.Request): void {
    this.httpClient.post<Recipient.RecipientId>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateRecipient(recipientId: Recipient.Id, body: Recipient.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteRecipient(recipientId: Recipient.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeRecipients(recipientId: Recipient.Id, body: Recipient.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}/merge`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
