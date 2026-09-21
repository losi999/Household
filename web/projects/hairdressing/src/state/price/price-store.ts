import { Searchable } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withPriceApiEvents } from '@hairdressing/state/price/with-price-api-events';
import { withPriceEvents } from '@hairdressing/state/price/with-price-events';
import { withPriceReducer } from '@hairdressing/state/price/with-price-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const PRICE_STORE_INITIAL_STATE = new InjectionToken<PriceState>('PRICE_STORE_INITIAL_STATE');

export type PriceState = {
  priceList: Searchable<Responses.Price>[];
  isInProgress: Api.Price.Id[];
};

export const providePriceStoreInitialState = (state: PriceState = {
  isInProgress: [],
  priceList: [],
}): ValueProvider => {
  return {
    provide: PRICE_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const PriceStore = signalStore({
  providedIn: 'root',
}, 
withState<PriceState>(() => {
  const initialState = inject(PRICE_STORE_INITIAL_STATE);

  return initialState;
}),
withPriceReducer(),
withPriceApiEvents(),
withPriceEvents(),
);
