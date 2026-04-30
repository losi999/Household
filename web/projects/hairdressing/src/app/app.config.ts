import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects, NavigationEffects, NotificationEffects } from '@household/shared-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({}),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(), 
    }),
    provideEffects(AuthEffects, NotificationEffects, NavigationEffects),
  ],
};
