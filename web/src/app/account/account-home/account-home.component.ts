import { Component, OnDestroy, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AccountFormComponent, AccountFormData, AccountFormResult } from 'src/app/account/account-form/account-form.component';
import { AccountService } from 'src/app/account/account.service';

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent implements OnInit, OnDestroy {
  onlyOpenAccounts: boolean;
  accounts: Account.Response[];
  refreshList: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.refreshList.unsubscribe();
  }

  ngOnInit(): void {
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.onlyOpenAccounts = true;

    this.refreshList = this.accountService.refreshList.subscribe({
      next: () => {
        this.accountService.listAccounts().subscribe((accounts) => {
          this.accounts = accounts;
        });
      },
    });
  }

  create() {
    const dialogRef = this.dialog.open<AccountFormComponent, AccountFormData, AccountFormResult>(AccountFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.accountService.createAccount(values);
        }
      },
    });
  }
}
