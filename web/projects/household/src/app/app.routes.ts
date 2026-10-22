import { Routes } from '@angular/router';
import { authenticatedGuard, unauthenticatedGuard } from '@household/shared-ui';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Bejelentkezés',
    loadComponent: () => import('@household/app/auth/login/login').then(m => m.Login),
    canActivate: [unauthenticatedGuard],
  },
  {
    path: 'categories',
    title: 'Kategóriák',
    loadComponent: () => import('@household/app/category/category-home/category-home').then(m => m.CategoryHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'recipients',
    title: 'Partnerek',
    loadComponent: () => import('@household/app/recipient/recipient-home/recipient-home').then(m => m.RecipientHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'products',
    title: 'Termékek',
    loadComponent: () => import('@household/app/product/product-home/product-home').then(m => m.ProductHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'accounts',
    title: 'Számlák',
    loadComponent: () => import('@household/app/account/account-home/account-home').then(m => m.AccountHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'projects',
    title: 'Projektek',
    loadComponent: () => import('@household/app/project/project-home/project-home').then(m => m.ProjectHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'accounts/:accountId',
    loadComponent: () => import('@household/app/transaction/transaction-home/transaction-home').then(m => m.TransactionHome),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'accounts/:accountId/transactions/new',
    title: 'Új tranzakció',
    loadComponent: () => import('@household/app/transaction/transaction-create/transaction-create').then(m => m.TransactionCreate),
    canMatch: [authenticatedGuard],
  },
  {
    path: 'accounts/:accountId/balance',
    title: 'Egyenleg kalkulátor',
    loadComponent: () => import('@household/app/account/account-balance-calculator/account-balance-calculator').then(m => m.AccountBalanceCalculator),
    canMatch: [authenticatedGuard],
  },

  {
    path: '',
    title: 'Kezdőlap',
    loadComponent: () => import('@household/app/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome),
    canMatch: [authenticatedGuard],
  },
];
