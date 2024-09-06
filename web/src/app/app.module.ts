import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import localeHu from '@angular/common/locales/hu';
import { registerLocaleData } from '@angular/common';
import { TransactionModule } from './transaction/transaction.module';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { AuthInterceptor } from '@household/web/app/auth/auth.interceptor';
import { AuthModule } from '@household/web/app/auth/auth.module';
import { ProgressInterceptor } from '@household/web/app/shared/interceptors/progress.interceptor';
import { ProductModule } from '@household/web/app/product/product.module';
import { ProgressIndicatorComponent } from '@household/web/app/shared/progress-indicator/progress-indicator.component';
import { CustomDateAdapter } from '@household/web/app/shared/data-adapter';
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
      provide: DateAdapter,
      useClass: CustomDateAdapter,
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
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule { }
