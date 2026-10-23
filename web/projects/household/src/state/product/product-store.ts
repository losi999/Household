import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withProductApiEvents } from '@household/state/product/with-product-api-events';
import { withProductEvents } from '@household/state/product/with-product-events';
import { withProductReducer } from '@household/state/product/with-product-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';
import { Searchable } from '@household/shared/types/common';

const PRODUCT_STORE_INITIAL_STATE = new InjectionToken<ProductState>('PRODUCT_STORE_INITIAL_STATE');

export type ProductState = {
  productList: Searchable<Responses.Product>[];
  isInProgress: Api.Product.Id[];
  selectedProduct: Responses.Product;
};

export const provideProductStoreInitialState = (state: ProductState = {
  productList: [],
  isInProgress: [],
  selectedProduct: undefined,
}): ValueProvider => {
  return {
    provide: PRODUCT_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const ProductStore = signalStore({
  providedIn: 'root',
},
withState<ProductState>(() => {
  const initialState = inject(PRODUCT_STORE_INITIAL_STATE);

  return initialState;
}),
withProductReducer(),
withProductApiEvents(),
withProductEvents(),
);
