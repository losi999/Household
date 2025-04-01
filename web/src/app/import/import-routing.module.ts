import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportHomeComponent } from '@household/web/app/import/import-home/import-home.component';
import { ImportTransactionsHomeComponent } from '@household/web/app/import/import-transactions-home/import-transactions-home.component';

const routes: Routes = [
  {
    path: '',
    component: ImportHomeComponent,
  },
  {
    path: ':fileId/transactions',
    component: ImportTransactionsHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportRoutingModule { }
