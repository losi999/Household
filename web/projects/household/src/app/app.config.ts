import { ApplicationConfig, inject, isDevMode, LOCALE_ID, provideBrowserGlobalErrorListeners, provideEnvironmentInitializer } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { API_URL, authInterceptor, AuthStore, NavigationStore, NotificationStore, progressInterceptor, ProgressStore } from '@household/shared-ui';
import { jwtDecode } from 'jwt-decode';
import { provideProjectStoreInitialState } from '@household/state/project/project-store';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { provideRecipientStoreInitialState } from '@household/state/recipient/recipient-store';

registerLocaleData(localeHu);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: API_URL,
      useValue: environment.apiUrl,
    },
    {
      provide: jwtDecode,
      useValue: jwtDecode,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'hu-HU',
    },
    {
      provide: LOCALE_ID,
      useValue: 'hu-HU',
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
        appearance: 'fill',
      },
    },
    provideProjectStoreInitialState(),
    provideRecipientStoreInitialState(),
    // provideCalendarStoreInitialState(),
    provideHttpClient(withInterceptors([
      authInterceptor,
      progressInterceptor,
    ])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideNativeDateAdapter(),
    provideEnvironmentInitializer(() => {
      inject(NavigationStore);
      inject(AuthStore);
      inject(NotificationStore);
      inject(ProgressStore);
    }),
  ],
};
