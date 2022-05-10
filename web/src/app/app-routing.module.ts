import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/auth/login/login.component';
import { AnonymousGuard } from 'src/app/guards/anonymous.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      requireLogin: false,
    },
    canActivate: [AnonymousGuard],
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
    data: {
      requireLogin: true,
    },
    canLoad: [AnonymousGuard],
  },
  {
    path: 'categories',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
    data: {
      requireLogin: true,
    },
    canLoad: [AnonymousGuard],
  },
  {
    path: 'recipients',
    loadChildren: () => import('./recipient/recipient.module').then(m => m.RecipientModule),
    data: {
      requireLogin: true,
    },
    canLoad: [AnonymousGuard],
  },
  {
    path: '',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    data: {
      requireLogin: true,
    },
    canLoad: [AnonymousGuard],
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
