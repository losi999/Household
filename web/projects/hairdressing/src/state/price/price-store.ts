import { Searchable } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { signalStore, withState } from '@ngrx/signals';
import { withPriceApiEvents } from '@hairdressing/state/price/with-price-api-events';
import { withPriceEvents } from '@hairdressing/state/price/with-price-events';
import { withPriceReducer } from '@hairdressing/state/price/with-price-reducer';

export type PriceState = {
  priceList: Searchable<Price.Response>[];
  isInProgress: Price.Id[];
};

export const PriceStore = signalStore({
  providedIn: 'root',
}, 
withState<PriceState>({
  priceList: [],
  isInProgress: [],
}),
withPriceReducer(),
withPriceApiEvents(),
withPriceEvents(),
);
