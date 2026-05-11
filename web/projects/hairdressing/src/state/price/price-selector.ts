import { PriceState } from '@hairdressing/state/price/price-reducer';
import { Price } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectPrices = createFeatureSelector<PriceState>('price');

export const selectPriceList = createSelector(selectPrices, ({ priceList }) => {
  return structuredClone(priceList);
});

export const selectPriceIsInProgress = (priceId: Price.Id) => createSelector(
  selectPrices, ({ isInProgress }) => {
    return isInProgress.includes(priceId);
  },
);  
  
