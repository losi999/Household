import { EnvironmentProviders, Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CalendarDateAdapter } from '@household/web/app/hairdressing/calendar/calendar-date-adapter';
import { CalendarEffects } from '@household/web/app/hairdressing/calendar/state/calendar.effects';
import { provideEffects } from '@ngrx/effects';

export const calendarProviders: (Provider | EnvironmentProviders)[] = [
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
];
