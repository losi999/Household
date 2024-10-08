import { Component, Input } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { AccountService } from 'src/app/account/account.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss'],
})
export class AccountListItemComponent {
  @Input() account: Account.Response;
  notificationCount: number;

  get balanceTitle(): string {
    switch (this.account.accountType) {
      case 'loan': return this.account.balance <= 0 ? 'Kintlévőség' : 'Tartozás';
      default: return 'Egyenleg';
    }
  }

  get balance(): number {
    return this.account.accountType === 'loan' ? Math.abs(this.account.balance) : this.account.balance;
  }

  constructor(private accountService: AccountService, private dialogService: DialogService) { }

  delete(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.dialogService.openDeleteAccountDialog(this.account).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.accountService.deleteAccount(this.account.accountId);
        }
      });
  }

  edit(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.dialogService.openEditAccountDialog(this.account);
  }
}
