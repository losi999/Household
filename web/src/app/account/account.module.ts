import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountRoutingModule } from 'src/app/account/account-routing.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountListItemComponent } from './account-list-item/account-list-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountTransactionsHomeComponent } from './account-transactions-home/account-transactions-home.component';
import { AccountTransactionsListComponent } from './account-transactions-list/account-transactions-list.component';
import { AccountTransactionsListItemComponent } from './account-transactions-list-item/account-transactions-list-item.component';
import { OpenAccountFilterPipe } from './pipes/open-account.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountFormComponent } from './account-form/account-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ToolbarComponent } from 'src/app/shared/toolbar/toolbar.component';
import { AutocompleteModule } from 'src/app/shared/autocomplete/autocomplete.module';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';
import { MatListModule } from '@angular/material/list';
import { TransactionModule } from 'src/app/transaction/transaction.module';

@NgModule({
  declarations: [
    AccountHomeComponent,
    AccountListComponent,
    AccountListItemComponent,
    AccountTransactionsHomeComponent,
    AccountTransactionsListComponent,
    AccountTransactionsListItemComponent,
    OpenAccountFilterPipe,
    AccountFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatListModule,
    FormsModule,
    AccountRoutingModule,
    MatDialogModule,
    ToolbarComponent,
    AutocompleteModule,
    ClearableInputComponent,
    TransactionModule,
  ],
})
export class AccountModule { }
