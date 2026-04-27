import { PriceState } from '@household/web/app/hairdressing/price/state/price.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectPrices = createFeatureSelector<PriceState>('prices');

export const selectPriceList = createSelector(selectPrices, (prices) => {
  return prices;
});
