import { Routes } from '@angular/router';
import { authenticatedGuard, unauthenticatedGuard } from '@household/shared-ui';
import { UserType } from '@household/shared/enums';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Bejelentkezés',
    loadComponent: () => import('@hairdressing/app/auth/login/login').then(m => m.Login),
    canActivate: [unauthenticatedGuard],
  },
  {
    path: 'customers',
    title: 'Vendégek',
    loadComponent: () => import('@hairdressing/app/customer/customer-home/customer-home').then(m => m.CustomerHome),
    canMatch: [authenticatedGuard],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
  },
  {
    path: 'prices',
    title: 'Árlista',
    loadComponent: () => import('@hairdressing/app/price/price-home/price-home').then(m => m.PriceHome),
    canMatch: [authenticatedGuard],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
  },
  {
    path: 'income',
    title: 'Bevétel',
    loadComponent: () => import('@hairdressing/app/income/income-home/income-home').then(m => m.IncomeHome),
    canMatch: [authenticatedGuard],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
  },
  {
    path: '',
    title: 'Naptár',
    loadComponent: () => import('@hairdressing/app/calendar/calendar-home/calendar-home').then(m => m.CalendarHome),
    canMatch: [authenticatedGuard],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
  },
];
