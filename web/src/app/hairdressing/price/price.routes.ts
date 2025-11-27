import { Routes } from '@angular/router';
import { PriceListComponent } from '@household/web/app/hairdressing/price/price-list/price-list.component';

export const routes: Routes = [
  {
    path: '',
    component: PriceListComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
