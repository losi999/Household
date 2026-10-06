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
    path: 'projects',
    title: 'Projektek',
    loadComponent: () => import('@household/app/project/project-home/project-home').then(m => m.ProjectHome),
    canMatch: [authenticatedGuard],
  },

  {
    path: '',
    title: 'Kezdőlap',
    loadComponent: () => import('@household/app/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome),
    canMatch: [authenticatedGuard],
  },
];
