import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HairdressingRoutingModule } from './hairdressing-routing.module';
import { HairdressingIncomeHomeComponent } from './hairdressing-income-home/hairdressing-income-home.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DaysOfMonthPipe } from '@household/web/app/shared/days-of-month.pipe';
import { HairdressingIncomeListComponent } from './hairdressing-income-list/hairdressing-income-list.component';
import { HairdressingIncomeListItemComponent } from './hairdressing-income-list-item/hairdressing-income-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { MatChipsModule } from '@angular/material/chips';
import { SplitPipe } from '@household/web/app/shared/split.pipe';
import { EffectsModule } from '@ngrx/effects';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { StoreModule } from '@ngrx/store';
import { priceReducer } from '@household/web/app/hairdressing/price/state/price.reducer';
import { customerReducer } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { calendarReducer } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';

@NgModule({
  declarations: [
    HairdressingIncomeHomeComponent,
    HairdressingIncomeListComponent,
    HairdressingIncomeListItemComponent,
  ],
  imports: [
    CommonModule,
    HairdressingRoutingModule,
    ToolbarComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    DaysOfMonthPipe,
    AmountInputComponent,
    MatChipsModule,
    SplitPipe,
    EffectsModule.forFeature([
      PriceApiEffects,
      CustomerApiEffects,
      CalendarApiEffects,
    ]),
    StoreModule.forFeature('prices', priceReducer),
    StoreModule.forFeature('customers', customerReducer),
    StoreModule.forFeature('calendar', calendarReducer),
  ],
})
export class HairdressingModule { }
