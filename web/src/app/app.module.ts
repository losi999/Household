import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import localeHu from '@angular/common/locales/hu';
import { registerLocaleData } from '@angular/common';
import { TransactionModule } from './transaction/transaction.module';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthInterceptor } from '@household/web/interceptors/auth.interceptor';
import { AuthModule } from '@household/web/app/auth/auth.module';
import { ProgressInterceptor } from '@household/web/interceptors/progress.interceptor';
import { ProductModule } from '@household/web/app/product/product.module';
import { ProgressIndicatorComponent } from '@household/web/app/shared/progress-indicator/progress-indicator.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { accountReducer } from '@household/web/state/account/account.reducer';
import { projectReducer } from '@household/web/state/project/project.reducer';
import { recipientReducer } from '@household/web/state/recipient/recipient.reducer';
import { categoryReducer } from '@household/web/state/category/category.reducer';
import { progressReducer } from '@household/web/state/progress/progress.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProjectEffects } from '@household/web/state/project/project.effects';
import { NotificationEffects } from '@household/web/state/notification/notification.effects';
import { RecipientEffects } from '@household/web/state/recipient/recipient.effects';
import { CategoryEffects } from '@household/web/state/category/category.effects';
import { ProductEffects } from '@household/web/state/product/product.effects';
import { AccountEffects } from '@household/web/state/account/account.effects';
import { productReducer } from '@household/web/state/product/product.reducer';
import { TransactionEffects } from '@household/web/state/transaction/transaction.effects';
import { transactionReducer } from '@household/web/state/transaction/transaction.reducer';
import { NavigationEffects } from '@household/web/state/navigation/navigation.effects';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { DialogEffects } from '@household/web/state/dialog/dialog.effects';
import { FileEffects } from '@household/web/state/file/file.effects';
import { fileReducer } from '@household/web/state/file/file.reducer';
import { importReducer } from '@household/web/state/import/import.reducer';
import { ImportEffects } from '@household/web/state/import/import.effects';
import { SettingEffects } from '@household/web/state/setting/setting.effects';
import { settingReducer } from '@household/web/state/setting/setting.reducer';
import { HairdressingEffects } from '@household/web/state/hairdressing/hairdressing.effects';
import { hairdressingReducer } from '@household/web/state/hairdressing/hairdressing.reducer';
import { userReducer } from '@household/web/state/user/user.reducer';
import { UserEffects } from '@household/web/state/user/user.effects';
import { AuthEffects } from '@household/web/state/auth/auth.effects';
import { customerReducer } from '@household/web/state/customer/customer.reducer';
import { CustomerEffects } from '@household/web/state/customer/customer.effects';

registerLocaleData(localeHu);

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    TransactionModule,
    ProductModule,
    AuthModule,
    ProgressIndicatorComponent,
    StoreModule.forRoot({
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
      customers: customerReducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    EffectsModule.forRoot([
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
      CustomerEffects,
    ]),
  ],
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
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule { }
