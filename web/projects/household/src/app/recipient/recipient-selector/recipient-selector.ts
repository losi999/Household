import { Component, effect, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconText, ProgressStore, SelectionStore } from '@household/shared-ui';
import { Responses } from '@household/shared/types/responses';
import { recipientEvents } from '@household/state/recipient/recipient-events';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    IconText,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'household-recipient-selector',
  styleUrl: './recipient-selector.scss',
  templateUrl: './recipient-selector.html',
})
export class RecipientSelector implements FormValueControl<Responses.Recipient> {
  private readonly recipientEvents = injectDispatch(recipientEvents);
  private readonly selectionStore = inject(SelectionStore);
  readonly progressStore = inject(ProgressStore);
  private selectionId: string;

  value = model<Responses.Recipient>();
  label = input<string>();
  required = input(false);
  items = input<Responses.Recipient[]>([]);

  constructor() {
    effect(() => {
      const selectedRecipient = this.selectionStore.selectedItems()[this.selectionId] as Responses.Recipient;

      if (selectedRecipient) {
        this.value.set(selectedRecipient);
      }
    });
  }

  onRemoveRecipient() {
    this.value.set(null);
  }

  onSelectRecipient() {
    this.selectionId = crypto.randomUUID();
    this.recipientEvents.selectRecipient({
      selectionId: this.selectionId,
      recipients: this.items(),
    });
  }
}
