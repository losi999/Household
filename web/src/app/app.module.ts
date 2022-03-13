import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import localeHu from '@angular/common/locales/hu';
import { registerLocaleData } from '@angular/common';
import { TransactionModule } from './transaction/transaction.module';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

registerLocaleData(localeHu);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    TransactionModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
