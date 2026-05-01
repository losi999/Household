import { PriceState } from '@hairdressing/state/price/price-reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectPrices = createFeatureSelector<PriceState>('prices');

export const selectPriceList = createSelector(selectPrices, (prices) => {
  return prices;
});
