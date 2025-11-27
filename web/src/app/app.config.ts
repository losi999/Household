import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, isDevMode, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { routes } from '@household/web/app/app.routes';
import { AuthInterceptor } from '@household/web/interceptors/auth.interceptor';
import { ProgressInterceptor } from '@household/web/interceptors/progress.interceptor';
import { AccountEffects } from '@household/web/state/account/account.effects';
import { accountReducer } from '@household/web/state/account/account.reducer';
import { AuthEffects } from '@household/web/state/auth/auth.effects';
import { CategoryEffects } from '@household/web/state/category/category.effects';
import { categoryReducer } from '@household/web/state/category/category.reducer';
import { DialogEffects } from '@household/web/state/dialog/dialog.effects';
import { FileEffects } from '@household/web/state/file/file.effects';
import { fileReducer } from '@household/web/state/file/file.reducer';
import { HairdressingEffects } from '@household/web/state/hairdressing/hairdressing.effects';
import { hairdressingReducer } from '@household/web/state/hairdressing/hairdressing.reducer';
import { ImportEffects } from '@household/web/state/import/import.effects';
import { importReducer } from '@household/web/state/import/import.reducer';
import { NavigationEffects } from '@household/web/state/navigation/navigation.effects';
import { NotificationEffects } from '@household/web/state/notification/notification.effects';
import { ProductEffects } from '@household/web/state/product/product.effects';
import { productReducer } from '@household/web/state/product/product.reducer';
import { progressReducer } from '@household/web/state/progress/progress.reducer';
import { ProjectEffects } from '@household/web/state/project/project.effects';
import { projectReducer } from '@household/web/state/project/project.reducer';
import { RecipientEffects } from '@household/web/state/recipient/recipient.effects';
import { recipientReducer } from '@household/web/state/recipient/recipient.reducer';
import { SettingEffects } from '@household/web/state/setting/setting.effects';
import { settingReducer } from '@household/web/state/setting/setting.reducer';
import { TransactionEffects } from '@household/web/state/transaction/transaction.effects';
import { transactionReducer } from '@household/web/state/transaction/transaction.reducer';
import { UserEffects } from '@household/web/state/user/user.effects';
import { userReducer } from '@household/web/state/user/user.reducer';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProgressInterceptor,
      multi: true,
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
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEffects([
      ProjectEffects,
      RecipientEffects,
      CategoryEffects,
      ProductEffects,
      AccountEffects,
      NotificationEffects,
      TransactionEffects,
      NavigationEffects,
      DialogEffects,
      FileEffects,
      ImportEffects,
      SettingEffects,
      HairdressingEffects,
      UserEffects,
      AuthEffects,
    ]),
    provideStore({
      accounts: accountReducer,
      projects: projectReducer,
      recipients: recipientReducer,
      categories: categoryReducer,
      progress: progressReducer,
      products: productReducer,
      transactions: transactionReducer,
      files: fileReducer,
      import: importReducer,
      settings: settingReducer,
      hairdressing: hairdressingReducer,
      users: userReducer,
    }),
    provideStoreDevtools({
      maxAge: 25, 
      logOnly: !isDevMode(),
    }),
  ],
};

