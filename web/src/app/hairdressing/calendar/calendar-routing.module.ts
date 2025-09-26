import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarEntryPayingComponent } from '@household/web/app/hairdressing/calendar/calendar-entry-paying/calendar-entry-paying.component';
import { CalendarHomeComponent } from '@household/web/app/hairdressing/calendar/calendar-home/calendar-home.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarHomeComponent,
  },
  {
    path: 'entries/:calendarEntryId/paying',
    component: CalendarEntryPayingComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarRoutingModule { }
