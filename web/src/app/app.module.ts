import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
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
