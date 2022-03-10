import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from 'src/app/account/account-transactions-home/account-transactions-home.component';
import { AccountListResolver } from 'src/app/account/resolvers/account-list.resolver';
import { AccountTransactionsListResolver } from 'src/app/account/resolvers/account-transactions-list.resolver';

const routes: Routes = [
  {
    path: '',
    component: AccountHomeComponent,
    resolve: {
      accounts: AccountListResolver,
    },
  },
  {
    path: 'accounts/:accountId',
    component: AccountTransactionsHomeComponent,
    resolve: {
      transactions: AccountTransactionsListResolver,
    }
  }
  // {
  //   path: 'create',
  //   component: TeamFormComponent,
  // },
  // {
  //   path: ':teamId',
  //   component: TeamFormComponent,
  //   resolve: {
  //     team: TeamResolver,
  //   },
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
