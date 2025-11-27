import { EnvironmentProviders, Provider } from '@angular/core';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { calendarReducer } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { CustomerEffects } from '@household/web/app/hairdressing/customer/state/customer.effects';
import { customerReducer } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { priceReducer } from '@household/web/app/hairdressing/price/state/price.reducer';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

export const hairdressingProviders: (Provider | EnvironmentProviders)[] = [
  provideEffects([
    PriceApiEffects,
    CustomerApiEffects,
    CustomerEffects,
    CalendarApiEffects,
  ]),
  provideState('prices', priceReducer),
  provideState('customers', customerReducer),
  provideState('calendar', calendarReducer),
];
