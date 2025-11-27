import { Provider, EnvironmentProviders } from '@angular/core';
import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
import { provideEffects } from '@ngrx/effects';

export const priceProviders: (Provider | EnvironmentProviders)[] = [provideEffects(PriceEffects)];
