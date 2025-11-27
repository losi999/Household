import { Component, Input } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { AccountListItemComponent } from '@household/web/app/account/account-list-item/account-list-item.component';
import { OpenAccountFilterPipe } from '@household/web/app/account/pipes/open-account.pipe';

@Component({
  selector: 'household-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
  imports: [
    AccountListItemComponent,
    OpenAccountFilterPipe,
  ],
})
export class AccountListComponent {
  @Input() onlyOpenAccounts: boolean;
  @Input() accounts: Account.Response[];
}
