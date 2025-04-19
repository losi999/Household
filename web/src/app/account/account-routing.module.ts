import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHomeComponent } from '@household/web/app/account/account-home/account-home.component';
import { AccountTransactionsHomeComponent } from '@household/web/app/account/account-transactions-home/account-transactions-home.component';
import { TransactionDetailsComponent } from '@household/web/app/transaction/transaction-details/transaction-details.component';
import { TransactionLoanEditComponent } from '@household/web/app/transaction/transaction-loan-edit/transaction-loan-edit.component';
import { TransactionPaymentEditComponent } from '@household/web/app/transaction/transaction-payment-edit/transaction-payment-edit.component';
import { TransactionSplitEditComponent } from '@household/web/app/transaction/transaction-split-edit/transaction-split-edit.component';
import { TransactionTransferEditComponent } from '@household/web/app/transaction/transaction-transfer-edit/transaction-transfer-edit.component';

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
    path: 'accounts/:accountId/transactions/:transactionId/edit/payment',
    component: TransactionPaymentEditComponent,
    data: {
      income: false,
    },
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit/income',
    component: TransactionPaymentEditComponent,
    data: {
      income: true,
    },
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit/loan',
    component: TransactionLoanEditComponent,
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit/transfer',
    component: TransactionTransferEditComponent,
  },
  {
    path: 'accounts/:accountId/transactions/:transactionId/edit/split',
    component: TransactionSplitEditComponent,
  },
  {
    path: 'accounts/:accountId/new/payment',
    component: TransactionPaymentEditComponent,
    data: {
      income: false,
    },
  },
  {
    path: 'accounts/:accountId/new/income',
    component: TransactionPaymentEditComponent,
    data: {
      income: true,
    },
  },
  {
    path: 'accounts/:accountId/new/loan',
    component: TransactionLoanEditComponent,
  },
  {
    path: 'accounts/:accountId/new/transfer',
    component: TransactionTransferEditComponent,
  },
  {
    path: 'accounts/:accountId/new/split',
    component: TransactionSplitEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule { }
