import { Routes } from '@angular/router';
import { CalendarHomeComponent } from '@household/web/app/hairdressing/calendar/calendar-home/calendar-home.component';

export const routes: Routes = [
  {
    path: '',
    component: CalendarHomeComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
