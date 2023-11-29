import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/auth/login/login.component';
import { canMatch, canActivate } from 'src/app/shared/guards';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      requireLogin: false,
    },
    canActivate: [canActivate],
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'products',
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'categories',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'recipients',
    loadChildren: () => import('./recipient/recipient.module').then(m => m.RecipientModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: 'reports',
    loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
    data: {
      requireLogin: true,
    },
    canMatch: [canMatch],
  },
  {
    path: '',
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
