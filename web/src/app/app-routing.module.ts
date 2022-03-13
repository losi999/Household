import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionEditComponent } from './transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
  },
  {
    path: 'transactions/:transactionId',
    component: TransactionEditComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
