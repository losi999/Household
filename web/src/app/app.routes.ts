import { Routes } from '@angular/router';
import { UserType } from '@household/shared/enums';
import { ConfirmUserComponent } from '@household/web/app/auth/confirm-user/confirm-user.component';
import { LoginComponent } from '@household/web/app/auth/login/login.component';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { calendarReducer } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { CustomerEffects } from '@household/web/app/hairdressing/customer/state/customer.effects';
import { customerReducer } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { priceReducer } from '@household/web/app/hairdressing/price/state/price.reducer';
import { unauthenticated, authenticated } from '@household/web/app/shared/guards';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

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
    providers: [
      provideEffects([
        PriceApiEffects,
        CustomerApiEffects,
        CustomerEffects,
        CalendarApiEffects,
      ]),
      provideState('prices', priceReducer),
      provideState('customers', customerReducer),
      provideState('calendar', calendarReducer),
    ],
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
