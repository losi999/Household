import { NgModule } from '@angular/core';
import { HairdressingRoutingModule } from './hairdressing-routing.module';
import { EffectsModule } from '@ngrx/effects';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { StoreModule } from '@ngrx/store';
import { priceReducer } from '@household/web/app/hairdressing/price/state/price.reducer';
import { customerReducer } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { calendarReducer } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { CustomerEffects } from '@household/web/app/hairdressing/customer/state/customer.effects';

@NgModule({
  declarations: [],
  imports: [
    HairdressingRoutingModule,
    EffectsModule.forFeature([
      PriceApiEffects,
      CustomerApiEffects,
      CustomerEffects,
      CalendarApiEffects,
    ]),
    StoreModule.forFeature('prices', priceReducer),
    StoreModule.forFeature('customers', customerReducer),
    StoreModule.forFeature('calendar', calendarReducer),
  ],
})
export class HairdressingModule { }
