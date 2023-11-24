import { Component, OnDestroy, OnInit } from '@angular/core';
import { Account } from '@household/shared/types/types';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent implements OnInit, OnDestroy {
  onlyOpenAccounts: boolean;
  accounts: Account.Response[];
  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService, private dialogService: DialogService) { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.onlyOpenAccounts = true;

    this.accountService.collectionUpdated.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.accountService.listAccounts().subscribe((accounts) => {
        this.accounts = accounts;
      });
    });
  }

  create() {
    this.dialogService.openCreateAccountDialog();
  }
}
