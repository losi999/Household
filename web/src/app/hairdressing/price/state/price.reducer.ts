import { Price } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';

export type PriceState = Price.Response[];

export const priceReducer = createReducer<PriceState>([],
  on(priceApiActions.listPricesCompleted, (_state, { prices }) => {
    return prices;
  }),

  on(priceApiActions.createPriceCompleted, priceApiActions.updatePriceCompleted, (_state, { priceId, name, amount, unitOfMeasurement }) => {
  
    return _state.filter(p => p.priceId !== priceId)
      .concat({
        priceId,
        name,
        amount,
        unitOfMeasurement,
      })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      }));
  }),
  
  on(priceApiActions.deletePriceCompleted, (_state, { priceId }) => {
    return _state.filter(p => p.priceId !== priceId);
  }),
);
