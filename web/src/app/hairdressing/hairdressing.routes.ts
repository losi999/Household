import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Routes } from '@angular/router';
import { CalendarDateAdapter } from '@household/web/app/hairdressing/calendar/calendar-date-adapter';
import { CalendarEffects } from '@household/web/app/hairdressing/calendar/state/calendar.effects';
import { HairdressingIncomeHomeComponent } from '@household/web/app/hairdressing/hairdressing-income-home/hairdressing-income-home.component';
import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
import { provideEffects } from '@ngrx/effects';

export const routes: Routes = [
  {
    path: 'income',
    component: HairdressingIncomeHomeComponent,
  },
  {
    path: 'prices',
    loadChildren: () => import('@household/web/app/hairdressing/price/price.routes').then(r => r.routes),
    providers: [provideEffects(PriceEffects)],
  },
  {
    path: 'calendar',
    loadChildren: () => import('@household/web/app/hairdressing/calendar/calendar.routes').then(r => r.routes),
    providers: [
      provideEffects(CalendarEffects),
      {
        provide: DateAdapter,
        useClass: CalendarDateAdapter, 
      },
      {
        provide: MAT_DATE_FORMATS,
        useValue: {
          parse: {
            dateInput: 'YYYY.MM.DD', 
          },
          display: {
            dateInput: 'input',
            monthYearLabel: {
              year: 'numeric',
              month: 'short', 
            },
            dateA11yLabel: {
              year: 'numeric',
              month: 'long',
              day: 'numeric', 
            },
            monthYearA11yLabel: {
              year: 'numeric',
              month: 'long', 
            },
          },
        }, 
      },
    ],
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
