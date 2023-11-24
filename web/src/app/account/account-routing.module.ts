import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from 'src/app/account/account-transactions-home/account-transactions-home.component';
import { accountListResolver, accountTransactionListResolver, categoryListResolver, projectListResolver, recipientListResolver, transactionResolver } from 'src/app/shared/resolvers';
import { TransactionDetailsComponent } from 'src/app/transaction/transaction-details/transaction-details.component';
import { TransactionEditComponent } from 'src/app/transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AccountHomeComponent,
    resolve: {
      accounts: accountListResolver,
    },
  },
  {
    path: 'accounts/:accountId',
    component: AccountTransactionsHomeComponent,
    resolve: {
      transactions: accountTransactionListResolver,
    },
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId',
    component: TransactionDetailsComponent,
    resolve: {
      transaction: transactionResolver,
    },
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit',
    component: TransactionEditComponent,
    resolve: {
      accounts: accountListResolver,
      projects: projectListResolver,
      categories: categoryListResolver,
      recipients: recipientListResolver,
      transaction: transactionResolver,
    },
  },
  {
    path: 'accounts/:accountId/new',
    component: TransactionEditComponent,
    resolve: {
      accounts: accountListResolver,
      projects: projectListResolver,
      categories: categoryListResolver,
      recipients: recipientListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
