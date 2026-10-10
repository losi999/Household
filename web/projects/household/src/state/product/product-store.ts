import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { ProductTreeNode } from '@household/state/product/product-events';
import { withProductApiEvents } from '@household/state/product/with-product-api-events';
import { withProductEvents } from '@household/state/product/with-product-events';
import { withProductReducer } from '@household/state/product/with-product-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const PRODUCT_STORE_INITIAL_STATE = new InjectionToken<ProductState>('PRODUCT_STORE_INITIAL_STATE');

export type ProductState = {
  productList: Responses.ProductTree[];
  isInProgress: Api.Product.Id[];
  pendingParentProduct: ProductTreeNode;
};

export const provideProductStoreInitialState = (state: ProductState = {
  productList: [],
  isInProgress: [],
  pendingParentProduct: undefined,
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
