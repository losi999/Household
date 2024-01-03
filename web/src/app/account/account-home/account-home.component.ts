import { Component } from '@angular/core';
import { AccountService } from 'src/app/account/account.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent {
  onlyOpenAccounts: boolean;
  get accountsByOwner() {
    return this.store.accountsByOwner.value;
  }

  constructor(private store: Store, private dialogService: DialogService, accountService: AccountService) {
    accountService.listAccounts();
    this.onlyOpenAccounts = true;
  }

  create() {
    this.dialogService.openCreateAccountDialog();
  }
}
