import { Component } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-recipient-list',
  templateUrl: './recipient-list.component.html',
  styleUrls: ['./recipient-list.component.scss'],
})
export class RecipientListComponent {
  get recipients(): Recipient.Response[] {
    return this.store.recipients.value;
  }

  constructor(private store: Store, recipientService: RecipientService) {
    recipientService.listRecipients();
  }
}
