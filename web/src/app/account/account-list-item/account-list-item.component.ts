import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';

@Component({
  selector: 'app-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent implements OnInit {
  @Input() account: Account.Response;
  notificationCount: number;

  get balanceTitle(): string {
    switch (this.account.accountType) {
      case 'loan': return this.account.balance >= 0 ? 'Kintlévőség' : 'Tartozás';
      default: return 'Egyenleg';
    }
  }


  constructor() { }

  ngOnInit(): void {
  }

}
