import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import localeHu from '@angular/common/locales/hu';
import { registerLocaleData } from '@angular/common';
import { TransactionModule } from './transaction/transaction.module';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthInterceptor } from 'src/app/auth/auth.interceptor';
import { AuthModule } from 'src/app/auth/auth.module';
import { ProgressInterceptor } from 'src/app/shared/interceptors/progress.interceptor';
import { ProductModule } from 'src/app/product/product.module';
import { ProgressIndicatorComponent } from 'src/app/shared/progress-indicator/progress-indicator.component';

registerLocaleData(localeHu);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
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
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProgressInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
