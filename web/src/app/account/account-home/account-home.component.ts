import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccountService } from 'src/app/account/account.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { accountApiActions } from 'src/app/account/account.actions';
import { selectAccountsByOwner } from 'src/app/account/account.selector';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent implements OnInit {
  onlyOpenAccounts: boolean;
  accountsByOwner = this.store.select(selectAccountsByOwner);

  constructor(private dialogService: DialogService, private accountService: AccountService, private store: Store) { }

  ngOnInit(): void {
    this.onlyOpenAccounts = true;

    this.accountService.listAccounts_().subscribe((accounts) => {
      this.store.dispatch(accountApiActions.retrievedAccountList({
        accounts,
      }));
    });
  }

  create() {
    this.dialogService.openCreateAccountDialog();
  }
}
