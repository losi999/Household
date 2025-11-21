import { Routes } from '@angular/router';
import { ImportHomeComponent } from '@household/web/app/import/import-home/import-home.component';
import { ImportTransactionsHomeComponent } from '@household/web/app/import/import-transactions-home/import-transactions-home.component';

export const routes: Routes = [
  {
    path: '',
    component: ImportHomeComponent,
  },
  {
    path: ':fileId/transactions',
    component: ImportTransactionsHomeComponent,
  },
];
