import { JsonPipe } from '@angular/common';
import { Component, effect, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AccountTypeIconPipe } from '@household/app/account/account-type-icon-pipe';
import { IconText, ProgressStore, SelectionStore } from '@household/shared-ui';
import { Responses } from '@household/shared/types/responses';
import { accountEvents } from '@household/state/account/account-events';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    IconText,
    AccountTypeIconPipe,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    JsonPipe,
  ],
  selector: 'household-account-selector',
  styleUrl: './account-selector.scss',
  templateUrl: './account-selector.html',
})
export class AccountSelector implements FormValueControl<Responses.Account> {
  private readonly accountEvents = injectDispatch(accountEvents);
  private readonly selectionStore = inject(SelectionStore);
  readonly progressStore = inject(ProgressStore);
  private selectionId: string;

  value = model<Responses.Account>();
  label = input<string>();
  required = input(false);
  items = input<Responses.Account[]>([]);

  constructor() {
    effect(() => {
      const selectedAccount = this.selectionStore.selectedItems()[this.selectionId] as Responses.Account;

      if(selectedAccount) {
        this.value.set(selectedAccount);
      }
    });
  }

  onRemoveAccount() {
    this.value.set(null);
  }
  onSelectAccount() {
    this.selectionId = crypto.randomUUID();
    this.accountEvents.selectAccount({
      selectionId: this.selectionId,
      accounts: this.items(),
    });
  }
}
