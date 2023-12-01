import { Component, Input } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
  @Input() onlyOpenAccounts: boolean;

  get accounts(): Observable<Account.Response[]> {
    return this.store.accounts.asObservable();
  }

  constructor(private store: Store, accountService: AccountService) {
    accountService.listAccounts();
  }
}
