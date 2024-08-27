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
import { AuthInterceptor } from 'src/app/auth/auth.interceptor';
import { AuthModule } from 'src/app/auth/auth.module';
import { ProgressInterceptor } from 'src/app/shared/interceptors/progress.interceptor';
import { ProductModule } from 'src/app/product/product.module';
import { ProgressIndicatorComponent } from 'src/app/shared/progress-indicator/progress-indicator.component';
import { CustomDateAdapter } from 'src/app/shared/data-adapter';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { accountReducer } from 'src/app/state/account/account.reducer';
import { projectReducer } from 'src/app/state/project/project.reducer';
import { recipientReducer } from 'src/app/state/recipient/recipient.reducer';
import { categoryReducer } from 'src/app/state/category/category.reducer';
import { progressReducer } from 'src/app/state/progress/progress.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProjectEffects } from 'src/app/state/project/project.effects';
import { NotificationEffects } from 'src/app/state/notification/notification.effects';
import { RecipientEffects } from 'src/app/state/recipient/recipient.effects';
import { CategoryEffects } from 'src/app/state/category/category.effects';
import { ProductEffects } from 'src/app/state/product/product.effects';
import { AccountEffects } from 'src/app/state/account/account.effects';

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
