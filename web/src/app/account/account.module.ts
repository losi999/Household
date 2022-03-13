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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountTransactionsHomeComponent } from './account-transactions-home/account-transactions-home.component';
import { AccountTransactionsListComponent } from './account-transactions-list/account-transactions-list.component';
import { AccountTransactionsListItemComponent } from './account-transactions-list-item/account-transactions-list-item.component';
import { OpenAccountFilterPipe } from './pipes/open-account.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AccountHomeComponent,
    AccountListComponent,
    AccountListItemComponent,
    AccountTransactionsHomeComponent,
    AccountTransactionsListComponent,
    AccountTransactionsListItemComponent,
    OpenAccountFilterPipe,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSlideToggleModule,
    FormsModule,
    AccountRoutingModule,
  ]
})
export class AccountModule { }
