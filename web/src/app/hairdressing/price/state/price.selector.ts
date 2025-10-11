import { PriceState } from '@household/web/app/hairdressing/price/state/price.reducer';
import { createFeatureSelector } from '@ngrx/store';

export const selectPrices = createFeatureSelector<PriceState>('prices');
