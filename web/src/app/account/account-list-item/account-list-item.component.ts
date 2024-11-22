import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { Observable } from 'rxjs';
import { selectAccountIsInProgress } from '@household/web/state/progress/progress.selector';

@Component({
  selector: 'household-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss'],
  standalone: false,
})
export class AccountListItemComponent implements OnInit {
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

  constructor(private store: Store, private dialogService: DialogService) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectAccountIsInProgress(this.account.accountId));
  }

  delete(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.dialogService.openDeleteAccountDialog(this.account).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(accountApiActions.deleteAccountInitiated({
            accountId: this.account.accountId,
          }));
        }
      });
  }

  edit(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.dialogService.openEditAccountDialog(this.account);
  }
}
