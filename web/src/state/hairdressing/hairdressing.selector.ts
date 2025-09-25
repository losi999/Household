import { HairdressingState } from '@household/web/state/hairdressing/hairdressing.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectHairdressing = createFeatureSelector<HairdressingState>('hairdressing');

export const selectIncomeByMonth = (month: string) => createSelector(selectHairdressing, ({ income }) => {
  return income?.[month];
});

export const selectPriceList = createSelector(selectHairdressing, ({ priceList }) => {
  return priceList;
});
