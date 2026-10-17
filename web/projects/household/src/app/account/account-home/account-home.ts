import { Component, inject } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AccountStore } from '@household/state/account/account-store';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { injectDispatch } from '@ngrx/signals/events';
import { AccountList } from '@household/app/account/account-list/account-list';

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    AccountList,
  ],
  selector: 'household-account-home',
  styleUrl: './account-home.scss',
  templateUrl: './account-home.html',
})
export class AccountHome {
  readonly accountStore = inject(AccountStore);
  private readonly accountApiEvents = injectDispatch(accountApiEvents);
  private readonly accountEvents = injectDispatch(accountEvents);

  constructor() {
    this.accountApiEvents.listAccountsInitiated();
  }

  onCreate() {
    this.accountEvents.createAccount();
  }
}
