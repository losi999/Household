import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionEditComponent } from './transaction/transaction-edit/transaction-edit.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
  },
  {
    path: 'categories',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
  },
  {
    path: 'recipients',
    loadChildren: () => import('./recipient/recipient.module').then(m => m.RecipientModule),
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
