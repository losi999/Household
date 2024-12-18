import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectAccountsByOwner } from '@household/web/state/account/account.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
  standalone: false,
})
export class AccountHomeComponent implements OnInit {
  onlyOpenAccounts: boolean;
  accountsByOwner = this.store.select(selectAccountsByOwner);

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.onlyOpenAccounts = true;

    this.store.dispatch(accountApiActions.listAccountsInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createAccount());
  }
}
