import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserType } from '@household/shared/enums';
import { ConfirmUserComponent } from '@household/web/app/auth/confirm-user/confirm-user.component';
import { LoginComponent } from '@household/web/app/auth/login/login.component';
import { authenticated, unauthenticated } from '@household/web/app/shared/guards';

const routes: Routes = [
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
    loadChildren: () => import('@household/web/app/project/project.module').then(m => m.ProjectModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'products',
    title: 'Termékek',
    loadChildren: () => import('@household/web/app/product/product.module').then(m => m.ProductModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'categories',
    title: 'Kategóriák',
    loadChildren: () => import('@household/web/app/category/category.module').then(m => m.CategoryModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'recipients',
    title: 'Partnerek',
    loadChildren: () => import('@household/web/app/recipient/recipient.module').then(m => m.RecipientModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'reports',
    title: 'Jelentések',
    loadChildren: () => import('@household/web/app/report/report.module').then(m => m.ReportModule),
    canMatch: [authenticated],
  },
  {
    path: 'imports',
    title: 'Importálás',
    loadChildren: () => import('@household/web/app/import/import.module').then(m => m.ImportModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Editor,
    },
  },
  {
    path: 'settings',
    title: 'Beállítások',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
    canMatch: [authenticated],
  },
  {
    path: 'hairdressing',
    title: 'Fodrászat',
    loadChildren: () => import('./hairdressing/hairdressing.module').then(m => m.HairdressingModule),
    canMatch: [authenticated],
    data: {
      requiredUserType: UserType.Hairdresser,
    },
  },
  {
    path: '',
    title: 'Számlák',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    canMatch: [authenticated],
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
