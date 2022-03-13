import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from 'src/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from 'src/app/account/account-transactions-home/account-transactions-home.component';
import { TransactionEditComponent } from 'src/app/transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AccountHomeComponent,
  },
  {
    path: 'accounts/:accountId',
    component: AccountTransactionsHomeComponent,
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId',
    component: TransactionEditComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
