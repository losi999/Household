import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { AccountListItem } from '@household/app/account/account-list-item/account-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    AccountListItem,
    MatListModule,
  ],
  selector: 'household-account-list',
  styleUrl: './account-list.scss',
  templateUrl: './account-list.html',
})
export class AccountList {
  accounts = input.required<Responses.Account[]>();
}
