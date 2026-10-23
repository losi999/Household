import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { AccountStore } from '@household/state/account/account-store';

export type AccountSelectDialogData = Searchable<Responses.Account>[];
export type AccountSelectDialogResult = Responses.Account;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    ClearableInput,
  ],
  styleUrl: './account-select-dialog.scss',
  templateUrl: './account-select-dialog.html',
})
export class AccountSelectDialog {
  private dialogRef = inject<MatDialogRef<AccountSelectDialog, AccountSelectDialogResult>>(MatDialogRef);
  public data = inject<AccountSelectDialogData>(MAT_DIALOG_DATA);
  private accountStore = inject(AccountStore);

  searchValue = model<string>('');

  selectableAccounts = computed(() => {
    const accountList = this.data ?? this.accountStore.accountList();

    if (!this.searchValue()) {
      return accountList;
    }

    return accountList.filter((account) => {
      return search(account, this.searchValue());
    });
  });

  onSelect(account: Responses.Account) {
    this.dialogRef.close(account);
  }
}
