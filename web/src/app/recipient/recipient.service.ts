import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecipientService {
  private _refreshList: Subject<void> = new Subject();

  get refreshList(): Observable<void> {
    return this._refreshList.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listRecipients(): Observable<Recipient.Response[]> {
    return this.httpClient.get<Recipient.Response[]>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`);
  }

  createRecipient(body: Recipient.Request): void {
    this.httpClient.post(`${environment.apiUrl}${environment.recipientStage}v1/recipients`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateRecipient(recipientId: Recipient.IdType, body: Recipient.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteRecipient(recipientId: Recipient.IdType): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}`).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeRecipients(recipientId: Recipient.IdType, body: Recipient.IdType[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.recipientStage}v1/recipients/${recipientId}/merge`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
