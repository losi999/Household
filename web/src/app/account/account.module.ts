import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountRoutingModule } from 'src/app/account/account-routing.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AccountTransactionsHomeComponent } from './account-transactions-home/account-transactions-home.component';
import { AccountTransactionsListComponent } from './account-transactions-list/account-transactions-list.component';
import { AccountPaymentTransactionListItemComponent } from './account-payment-transaction-list-item/account-payment-transaction-list-item.component';
import { AccountTransferTransactionListItemComponent } from './account-transfer-transaction-list-item/account-transfer-transaction-list-item.component';
import { AccountSplitTransactionListItemComponent } from './account-split-transaction-list-item/account-split-transaction-list-item.component';
import { AccountTransactionListItemComponent } from './account-transaction-list-item/account-transaction-list-item.component';

@NgModule({
  declarations: [
    AccountHomeComponent,
    AccountListComponent,
    AccountListItemComponent,
    AccountTransactionsHomeComponent,
    AccountTransactionsListComponent,
    AccountPaymentTransactionListItemComponent,
    AccountTransferTransactionListItemComponent,
    AccountSplitTransactionListItemComponent,
    AccountTransactionListItemComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    AccountRoutingModule,
  ]
})
export class AccountModule { }
