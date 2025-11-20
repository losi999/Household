import { NgModule } from '@angular/core';
import { PriceRoutingModule } from '@household/web/app/hairdressing/price/price-routing.module';
import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    PriceRoutingModule,
    EffectsModule.forFeature([PriceEffects]),
  ],
})
export class PriceModule { }
