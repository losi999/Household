import { Component, inject } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { injectDispatch } from '@ngrx/signals/events';
import { RecipientList } from '@household/app/recipient/recipient-list/recipient-list';

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    RecipientList,
  ],
  selector: 'household-recipient-home',
  styleUrl: './recipient-home.scss',
  templateUrl: './recipient-home.html',
})
export class RecipientHome {
  readonly recipientStore = inject(RecipientStore);
  private readonly recipientApiEvents = injectDispatch(recipientApiEvents);
  private readonly recipientEvents = injectDispatch(recipientEvents);

  constructor() {
    this.recipientApiEvents.listRecipientsInitiated();
  }

  create() {
    this.recipientEvents.createRecipient();
  }
}
