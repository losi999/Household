import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

type RecipientCreated = {
  action: 'created';
  recipientId: Recipient.Id;
  request: Recipient.Request;
};

type RecipientUpdated = {
  action: 'updated';
  recipientId: Recipient.Id;
  request: Recipient.Request;
};

type RecipientDeleted = {
  action: 'deleted';
  recipientId: Recipient.Id;
};

type RecipientsMerged = {
  action: 'merged';
  targetRecipientId: Recipient.Id;
  sourceRecipientIds: Recipient.Id[];
}
type RecipientEvent = RecipientCreated | RecipientUpdated | RecipientDeleted | RecipientsMerged;

@Injectable({
  providedIn: 'root',
})
export class RecipientService {
  private _collectionUpdated: Subject<RecipientEvent> = new Subject();

  get collectionUpdated(): Observable<RecipientEvent> {
    return this._collectionUpdated.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listRecipients(): Observable<Recipient.Response[]> {
    return this.httpClient.get<Recipient.Response[]>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`);
  }

  createRecipient(body: Recipient.Request): void {
    this.httpClient.post<Recipient.RecipientId>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`, body).subscribe({
      next: (value) => {
        this._collectionUpdated.next({
          action: 'created',
          recipientId: value.recipientId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateRecipient(recipientId: Recipient.Id, body: Recipient.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'updated',
          recipientId,
          request: body
        })
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteRecipient(recipientId: Recipient.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'deleted',
          recipientId
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeRecipients(recipientId: Recipient.Id, body: Recipient.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}/merge`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'merged',
          targetRecipientId: recipientId,
          sourceRecipientIds: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
