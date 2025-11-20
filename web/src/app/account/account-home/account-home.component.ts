import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectAccountsByOwner } from '@household/web/state/account/account.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountListComponent } from '@household/web/app/account/account-list/account-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatListModule,
    AsyncPipe,
    FormsModule,
    AccountListComponent,
    NgxSkeletonLoaderModule,
  ],
})
export class AccountHomeComponent implements OnInit {
  onlyOpenAccounts: boolean;
  accountsByOwner = this.store.select(selectAccountsByOwner);

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.onlyOpenAccounts = true;

    this.store.dispatch(accountApiActions.listAccountsInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createAccount());
  }
}
