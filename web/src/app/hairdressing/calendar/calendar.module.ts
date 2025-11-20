import { NgModule } from '@angular/core';
import { CalendarRoutingModule } from '@household/web/app/hairdressing/calendar/calendar-routing.module';
import { EffectsModule } from '@ngrx/effects';
import { CalendarEffects } from '@household/web/app/hairdressing/calendar/state/calendar.effects';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CalendarDateAdapter } from '@household/web/app/hairdressing/calendar/calendar-date-adapter';

@NgModule({
  declarations: [],
  imports: [
    CalendarRoutingModule,
    EffectsModule.forFeature([CalendarEffects]),
  ],
  providers: [
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
})
export class CalendarModule { }
