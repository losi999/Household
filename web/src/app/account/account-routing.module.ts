import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from '@household/web/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from '@household/web/app/account/account-transactions-home/account-transactions-home.component';
import { TransactionDetailsComponent } from '@household/web/app/transaction/transaction-details/transaction-details.component';
import { TransactionEditComponent } from '@household/web/app/transaction/transaction-edit/transaction-edit.component';

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
    component: TransactionDetailsComponent,
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit',
    component: TransactionEditComponent,
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
