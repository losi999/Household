import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Account } from '@household/shared/types/types';
import { AccountFormComponent, AccountFormData, AccountFormResult } from 'src/app/account/account-form/account-form.component';
import { AccountService } from 'src/app/account/account.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent {
  @Input() account: Account.Response;
  notificationCount: number;

  get balanceTitle(): string {
    switch (this.account.accountType) {
      case 'loan': return this.account.balance >= 0 ? 'Kintlévőség' : 'Tartozás';
      default: return 'Egyenleg';
    }
  }

  constructor(private accountService: AccountService, private dialog: MatDialog,) { }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a számlát?',
        content: this.account.name
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.deleteAccount(this.account.accountId)
      }
    });
  }

  open() {
  }

  close() {
  }

  edit() {
    const dialogRef = this.dialog.open<AccountFormComponent, AccountFormData, AccountFormResult>(AccountFormComponent, { data: this.account })

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.accountService.updateAccount(this.account.accountId, values);
      }
    });
  }
}
