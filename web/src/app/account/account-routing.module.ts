import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from 'src/app/account/account-transactions-home/account-transactions-home.component';
import { AccountListResolver } from 'src/app/resolvers/account-list.resolver';
import { AccountTransactionListResolver } from 'src/app/resolvers/account-transaction-list.resolver';
import { CategoryListResolver } from 'src/app/resolvers/category-list.resolver';
import { ProjectListResolver } from 'src/app/resolvers/project-list.resolver';
import { RecipientListResolver } from 'src/app/resolvers/recipient-list.resolver';
import { TransactionResolver } from 'src/app/resolvers/transaction.resolver';
import { TransactionEditComponent } from 'src/app/transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AccountHomeComponent,
    resolve: {
      accounts: AccountListResolver,
    }
  },
  {
    path: 'accounts/:accountId',
    component: AccountTransactionsHomeComponent,
    resolve: {
      transactions: AccountTransactionListResolver,
    }
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId',
    component: TransactionEditComponent,
    resolve: {
      accounts: AccountListResolver,
      projects: ProjectListResolver,
      categories: CategoryListResolver,
      recipients: RecipientListResolver,
      transaction: TransactionResolver,
    }
  },
  {
    path: 'accounts/:accountId/new',
    component: TransactionEditComponent,
    resolve: {
      accounts: AccountListResolver,
      projects: ProjectListResolver,
      categories: CategoryListResolver,
      recipients: RecipientListResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
