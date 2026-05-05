import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects, authInterceptor, NavigationEffects, NotificationEffects, progressInterceptor, progressReducer } from '@household/shared-ui';
import { priceReducer } from '@hairdressing/state/price/price-reducer';
import { PriceApiEffects } from '@hairdressing/state/price/price-api-effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PriceEffects } from '@hairdressing/state/price/price-effects';
import { CustomerApiEffects } from '@hairdressing/state/customer/customer-api.effects';
import { customerReducer } from '@hairdressing/state/customer/customer.reducer';
import { CustomerEffects } from '@hairdressing/state/customer/customer.effects';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';

registerLocaleData(localeHu);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'hu-HU',
    },
    {
      provide: LOCALE_ID,
      useValue: 'hu-HU',
    },
    provideHttpClient(withInterceptors([
      authInterceptor,
      progressInterceptor,
    ])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      price: priceReducer,
      customer: customerReducer,
      progress: progressReducer,
    }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(), 
    }),
    provideEffects(AuthEffects, NotificationEffects, NavigationEffects, PriceApiEffects, PriceEffects, CustomerApiEffects, CustomerEffects),
  ],
};
