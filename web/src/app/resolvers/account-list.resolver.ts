import { Injectable } from '@angular/core';
import {
  Resolve,
} from '@angular/router';
import { Account } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';

@Injectable({
  providedIn: 'root',
})
export class AccountListResolver implements Resolve<Account.Response[]> {
  constructor(private accountService: AccountService) { }

  resolve(): Observable<Account.Response[]> {
    return this.accountService.listAccounts();
  }
}
