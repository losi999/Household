import { Routes } from '@angular/router';
import { UserType } from '@household/shared/enums';
import { ConfirmUserComponent } from '@household/web/app/auth/confirm-user/confirm-user.component';
import { LoginComponent } from '@household/web/app/auth/login/login.component';
import { hairdressingProviders } from '@household/web/app/hairdressing/hairdressing.providers';
import { unauthenticated, authenticated } from '@household/web/app/shared/guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Bejelentkezés',
    component: LoginComponent,
    canActivate: [unauthenticated],
  },
  {
    path: 'confirm-user',
    title: 'Jelszó megadása',
    component: ConfirmUserComponent,
    canActivate: [unauthenticated],
  },
  {
    path: 'projects',
    title: 'Projektek',
    loadChildren: () => import('@household/web/app/project/project.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'products',
    title: 'Termékek',
    loadChildren: () => import('@household/web/app/product/product.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'categories',
    title: 'Kategóriák',
    loadChildren: () => import('@household/web/app/category/category.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'recipients',
    title: 'Partnerek',
    loadChildren: () => import('@household/web/app/recipient/recipient.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'reports',
    title: 'Jelentések',
    loadChildren: () => import('@household/web/app/report/report.routes').then(r => r.routes),
    canMatch: [authenticated],
  },
  {
    path: 'imports',
    title: 'Importálás',
    loadChildren: () => import('@household/web/app/import/import.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'settings',
    title: 'Beállítások',
    loadChildren: () => import('./settings/settings.routes').then(r => r.routes),
    canMatch: [authenticated],
  },
  {
    path: 'hairdressing',
    title: 'Fodrászat',
    loadChildren: () => import('./hairdressing/hairdressing.routes').then(r => r.routes),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
    providers: hairdressingProviders,
  },
  {
    path: '',
    title: 'Számlák',
    loadChildren: () => import('@household/web/app/account/account.routes').then(r => r.routes),
    canMatch: [authenticated],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
