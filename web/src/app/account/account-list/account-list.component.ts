import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  @Input() accounts: Account.Response[];

  constructor() { }

  ngOnInit(): void {
  }

}
