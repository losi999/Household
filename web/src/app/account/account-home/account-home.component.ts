import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/account/account.service';
import { Observable } from 'rxjs';
import { Account } from '@household/shared/types/types';

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss']
})
export class AccountHomeComponent implements OnInit {
  onlyOpenAccounts: boolean;

  get accounts(): Observable<Account.Response[]> {
    return this.accountService.accounts;
  }
  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.accountService.listAccounts();

    this.onlyOpenAccounts = true;
  }
}
