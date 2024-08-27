import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from 'src/app/shared/dialog.service';
import { accountApiActions } from 'src/app/state/account/account.actions';
import { selectAccountsByOwner } from 'src/app/state/account/account.selector';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent implements OnInit {
  onlyOpenAccounts: boolean;
  accountsByOwner = this.store.select(selectAccountsByOwner);

  constructor(private dialogService: DialogService, private store: Store) { }

  ngOnInit(): void {
    this.onlyOpenAccounts = true;

    this.store.dispatch(accountApiActions.listAccountsInitiated());
  }

  create() {
    this.dialogService.openCreateAccountDialog();
  }
}
