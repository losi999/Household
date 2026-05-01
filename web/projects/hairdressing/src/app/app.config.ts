import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects, authInterceptor, NavigationEffects, NotificationEffects } from '@household/shared-ui';
import { priceReducer } from '@hairdressing/state/price/price-reducer';
import { PriceApiEffects } from '@hairdressing/state/price/price-api-effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PriceEffects } from '@hairdressing/state/price/price-effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      prices: priceReducer,
    }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(), 
    }),
    provideEffects(AuthEffects, NotificationEffects, NavigationEffects, PriceApiEffects, PriceEffects),
  ],
};
