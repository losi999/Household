import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAccountIsInProgress } from '@household/web/state/progress/progress.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss'],
  standalone: false,
})
export class AccountListItemComponent implements OnInit {
  @Input() account: Account.Response;
  notificationCount: number;

  balanceTitle: string;
  balance: number;
  isDisabled: Observable<boolean>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectAccountIsInProgress(this.account.accountId));
    this.balance = this.account.accountType === 'loan' ? Math.abs(this.account.balance) : this.account.balance;

    if (this.account.accountType === 'loan') {
      this.balanceTitle = this.account.balance <= 0 ? 'Kintlévőség' : 'Tartozás';
    } else {
      this.balanceTitle = 'Egyenleg';
    }
  }

  delete(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.store.dispatch(dialogActions.deleteAccount(this.account));
  }

  edit(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.store.dispatch(dialogActions.updateAccount(this.account));
  }
}
