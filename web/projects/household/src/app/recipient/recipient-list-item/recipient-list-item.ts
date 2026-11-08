import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';
import { recipientEvents } from '@household/state/recipient/recipient-events';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatButtonModule,
    MatListModule,
  ],
  selector: 'household-recipient-list-item',
  styleUrl: './recipient-list-item.scss',
  templateUrl: './recipient-list-item.html',
})
export class RecipientListItem {
  recipient = input.required<Responses.Recipient>();
  private recipientEvents = injectDispatch(recipientEvents);
  private readonly recipientStore = inject(RecipientStore);
  
  isDisabled = computed(() => {
    return this.recipientStore.isInProgress().includes(this.recipient().recipientId);
  });
  
  onShowMenu() {
    this.recipientEvents.openRecipientListItemSubmenu(this.recipient());
  }
}
