import { ApplicationConfig, inject, isDevMode, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideEnvironmentInitializer } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { API_URL, authInterceptor, AuthStore, NavigationStore, NotificationStore, progressInterceptor, ProgressStore } from '@household/shared-ui';
import { jwtDecode } from 'jwt-decode';
import { ProjectStore, provideProjectStoreInitialState } from '@household/state/project/project-store';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { provideRecipientStoreInitialState, RecipientStore } from '@household/state/recipient/recipient-store';
import { CategoryStore, provideCategoryStoreInitialState } from '@household/state/category/category-store';
import { AccountStore, provideAccountStoreInitialState } from '@household/state/account/account-store';
import { provideTransactionStoreInitialState } from '@household/state/transaction/transaction-store';
import { ProductStore, provideProductStoreInitialState } from '@household/state/product/product-store';
import { injectDispatch } from '@ngrx/signals/events';
import { projectApiEvents } from '@household/state/project/project-events';
import { accountApiEvents } from '@household/state/account/account-events';
import { productApiEvents } from '@household/state/product/product-events';
import { recipientApiEvents } from '@household/state/recipient/recipient-events';
import { categoryApiEvents } from '@household/state/category/category-events';

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
    provideCategoryStoreInitialState(),
    provideAccountStoreInitialState(),
    provideTransactionStoreInitialState(),
    provideProductStoreInitialState(),
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
    provideAppInitializer(() => {
      // inject(ProjectStore);
      // injectDispatch(projectApiEvents).listProjectsInitiated();
      // inject(AccountStore);
      // injectDispatch(accountApiEvents).listAccountsInitiated();
      // inject(ProductStore);
      // injectDispatch(productApiEvents).listProductsInitiated();
      // inject(RecipientStore);
      // injectDispatch(recipientApiEvents).listRecipientsInitiated();
      // inject(CategoryStore);
      // injectDispatch(categoryApiEvents).listCategoriesInitiated();
    }),
    provideEnvironmentInitializer(() => {
      inject(NavigationStore);
      inject(AuthStore);
      inject(NotificationStore);
      inject(ProgressStore);
    }),
  ],
};
