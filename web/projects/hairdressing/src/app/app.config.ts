import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID, provideEnvironmentInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_URL, authInterceptor, AuthStore, NavigationStore, progressInterceptor, ProgressStore } from '@household/shared-ui';
import { NotificationStore } from '@household/shared-ui';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { environment } from '@hairdressing/environments/environment';

registerLocaleData(localeHu);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: API_URL,
      useValue: environment.apiUrl,
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
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const customPaginatorIntl = new MatPaginatorIntl();

        customPaginatorIntl.getRangeLabel = (page, pageSize, length) => {
          const startIndex = page * pageSize;
          const endIndex = Math.min(startIndex + pageSize, length);
          return `${startIndex + 1} - ${endIndex} / ${length}`;
        };

        return customPaginatorIntl;
      }, 
    },
    provideHttpClient(withInterceptors([
      authInterceptor,
      progressInterceptor,
    ])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideEnvironmentInitializer(() => {
      inject(NavigationStore);
      inject(AuthStore);
      inject(NotificationStore);
      inject(ProgressStore);
    }),
  ],
};
