import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from 'src/app/account/account-transactions-home/account-transactions-home.component';
import { accountTransactionListResolver, transactionResolver } from 'src/app/shared/resolvers';
import { TransactionDetailsComponent } from 'src/app/transaction/transaction-details/transaction-details.component';
import { TransactionEditComponent } from 'src/app/transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AccountHomeComponent,
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
      transaction: transactionResolver,
    },
  },
  {
    path: 'accounts/:accountId/new',
    component: TransactionEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
