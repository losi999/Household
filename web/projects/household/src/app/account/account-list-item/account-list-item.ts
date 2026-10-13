import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';
import { accountEvents } from '@household/state/account/account-events';
import { AccountStore } from '@household/state/account/account-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatIconModule,
    MatListModule,
  ],
  selector: 'household-account-list-item',
  styleUrl: './account-list-item.scss',
  templateUrl: './account-list-item.html',
  host: {
    '[class.closed]': '!account().isOpen',
  },
})
export class AccountListItem {
  account = input.required<Responses.Account>();
  private accountEvents = injectDispatch(accountEvents);
  private readonly accountStore = inject(AccountStore);

  isDisabled = computed(() => {
    return this.accountStore.isInProgress().includes(this.account().accountId);
  });

  onShowMenu() {
    this.accountEvents.openAccountListItemSubmenu(this.account());
  }
}
