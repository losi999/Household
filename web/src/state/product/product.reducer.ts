import { Clean } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { productApiActions } from '@household/web/state/product/product.actions';

export const productReducer = createReducer<Clean<Product.Response>[]>([],
  on(productApiActions.listProductsCompleted, (_state, { products }) => {
    return products;
  }),
  // on(productApiActions.createProductCompleted, productApiActions.updateProductCompleted, (_state, { productId, name, description }) => {

  //   return _state.filter(p => p.productId !== productId)
  //     .concat({
  //       productId,
  //       name,
  //       description,
  //     })
  //     .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
  //       sensitivity: 'base',
  //     }));
  // }),
  on(productApiActions.deleteProductCompleted, (_state, { productId }) => {
    return _state.filter(p => p.productId !== productId);
  }),
  on(productApiActions.mergeProductsCompleted, (_state, { sourceProductIds }) => {
    return _state.filter(p => !sourceProductIds.includes(p.productId));
  }),
);
