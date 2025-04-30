import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@household/web/app/auth/login/login.component';
import { canMatch, canActivate } from '@household/web/app/shared/guards';

const routes: Routes = [
  {
    path: 'login',
    title: 'Bejelentkezés',
    component: LoginComponent,
    data: {
      requireLogin: false,
    },
    canActivate: [canActivate],
  },
  {
    path: 'projects',
    title: 'Projektek',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'products',
    title: 'Termékek',
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'categories',
    title: 'Kategóriák',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'recipients',
    title: 'Partnerek',
    loadChildren: () => import('./recipient/recipient.module').then(m => m.RecipientModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'reports',
    title: 'Jelentések',
    loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'imports',
    title: 'Importálás',
    loadChildren: () => import('./import/import.module').then(m => m.ImportModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'settings',
    title: 'Beállítások',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: '',
    title: 'Számlák',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
