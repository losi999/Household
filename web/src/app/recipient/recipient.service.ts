import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {
  private _recipients = new BehaviorSubject<Recipient.Response[]>([]);

  get recipients() {
    return this._recipients.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listRecipients(): void {
    this.httpClient.get<Recipient.Response[]>(`${environment.apiUrl}${environment.recipientStage}v1/recipients`)
      .subscribe(recipients => this._recipients.next(recipients));
  }
}
