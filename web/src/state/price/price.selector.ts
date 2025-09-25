import { PriceState } from '@household/web/state/price/price.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectPrice = createFeatureSelector<PriceState>('price');

export const selectPriceList = createSelector(selectPrice, ({ priceList }) => {
  return priceList;
});
