import { Component, Input } from '@angular/core';
import { Account } from '@household/shared/types/types';

@Component({
  selector: 'household-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
  @Input() onlyOpenAccounts: boolean;
  @Input() accounts: Account.Response[];
}
