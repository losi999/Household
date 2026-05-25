import { Searchable } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { signalStore, withState } from '@ngrx/signals';
import { withPriceApiEvents } from '@hairdressing/state/price/with-price-api-events';
import { withPriceEvents } from '@hairdressing/state/price/with-price-events';
import { withPriceReducer } from '@hairdressing/state/price/with-price-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const PRICE_STORE_INITIAL_STATE = new InjectionToken<PriceState>('PRICE_STORE_INITIAL_STATE');

export type PriceState = {
  priceList: Searchable<Price.Response>[];
  isInProgress: Price.Id[];
};

const initialState: PriceState = {
  isInProgress: [],
  priceList: [],
};

export const providePriceStoreInitialState = (state: PriceState = initialState): ValueProvider => {
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
},
),
withPriceReducer(),
withPriceApiEvents(),
withPriceEvents(),
);
