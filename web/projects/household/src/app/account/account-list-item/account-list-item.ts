import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AccountType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { accountEvents } from '@household/state/account/account-events';
import { AccountStore } from '@household/state/account/account-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatIconModule,
    MatListModule,
    DecimalPipe,
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

  balanceTitle = computed(() => {
    if (this.account().accountType !== AccountType.Loan) {
      return 'Egyenleg';
    }

    return this.account().balance < 0 ? 'Tartozás' : 'Kintlévőség';
  });

  isDisabled = computed(() => {
    return this.accountStore.isInProgress().includes(this.account().accountId);
  });

  onShowMenu() {
    this.accountEvents.openAccountListItemSubmenu(this.account());
  }
}
