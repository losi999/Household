import { Price } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { priceApiActions } from '@hairdressing/state/price/price-actions';
import { Searchable } from '@household/shared/types/common';
import { toSearchTerms } from '@household/shared/common/utils';

export type PriceState = {
  priceList: Searchable<Price.Response>[];
  isInProgress: Price.Id[];
};

export const priceReducer = createReducer<PriceState>({
  priceList: [],
  isInProgress: [],
},
on(priceApiActions.listPricesCompleted, (state, { prices }) => {
  return {
    ...state,
    priceList: prices.map(p => {
      return {
        ...p,
        searchTerms: toSearchTerms(p.name),
      };
    }),
  };
}),

on(priceApiActions.updatePriceInitiated, priceApiActions.deletePriceInitiated, (state, { priceId }) => {
  return {
    ...state,
    isInProgress: state.isInProgress.concat(priceId),
  };
}),

on(priceApiActions.updatePriceCompleted, priceApiActions.deletePriceCompleted, priceApiActions.deletePriceFailed, priceApiActions.updatePriceFailed, (state, { priceId }) => {
  return {
    ...state,
    isInProgress: state.isInProgress.filter(id => id !== priceId),
  };
}),

on(priceApiActions.createPriceCompleted, priceApiActions.updatePriceCompleted, (state, { priceId, name, amount, unitOfMeasurement }) => {

  return {
    ...state,
    priceList: state.priceList.filter(p => p.priceId !== priceId)
      .concat({
        priceId,
        name,
        amount,
        unitOfMeasurement,
      })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      })),
  };
}),
  
on(priceApiActions.deletePriceCompleted, (state, { priceId }) => {
  return {
    ...state,
    priceList: state.priceList.filter(p => p.priceId !== priceId),
  };
}),
);
