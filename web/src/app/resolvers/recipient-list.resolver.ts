import { Injectable } from '@angular/core';
import {
  Resolve,
} from '@angular/router';
import { Recipient } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { RecipientService } from 'src/app/recipient/recipient.service';

@Injectable({
  providedIn: 'root',
})
export class RecipientListResolver implements Resolve<Recipient.Response[]> {
  constructor(private recipientService: RecipientService) { }

  resolve(): Observable<Recipient.Response[]> {
    return this.recipientService.listRecipients();
  }
}
