import { Routes } from '@angular/router';
import { calendarProviders } from '@household/web/app/hairdressing/calendar/calendar.providers';
import { HairdressingIncomeHomeComponent } from '@household/web/app/hairdressing/hairdressing-income-home/hairdressing-income-home.component';
import { priceProviders } from '@household/web/app/hairdressing/price/price.providers';

export const routes: Routes = [
  {
    path: 'income',
    component: HairdressingIncomeHomeComponent,
  },
  {
    path: 'prices',
    loadChildren: () => import('@household/web/app/hairdressing/price/price.routes').then(r => r.routes),
    providers: priceProviders,
  },
  {
    path: 'calendar',
    loadChildren: () => import('@household/web/app/hairdressing/calendar/calendar.routes').then(r => r.routes),
    providers: calendarProviders,
  },
  {
    path: 'customers',
    loadChildren: () => import('@household/web/app/hairdressing/customer/customer.routes').then(r => r.routes),
  },
  {
    path: '**',
    redirectTo: 'income',
  },
];
