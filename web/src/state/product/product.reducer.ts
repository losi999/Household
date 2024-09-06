import { Product } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { productApiActions } from '@household/web/state/product/product.actions';

export const productReducer = createReducer<Product.GroupedResponse[]>([],
  on(productApiActions.listProductsCompleted, (_state, { products }) => {
    return products;
  }),
  on(productApiActions.deleteProductCompleted, (_state, { productId, categoryId }) => {
    return _state.reduce<Product.GroupedResponse[]>((accumulator, currentValue) => {
      if (currentValue.categoryId !== categoryId) {
        return [
          ...accumulator,
          currentValue,
        ];
      }

      return [
        ...accumulator,
        {
          ...currentValue,
          products: currentValue.products.filter(p => p.productId !== productId),
        },
      ];
    }, []);
  }),
  on(productApiActions.mergeProductsCompleted, (_state, { sourceProductIds, categoryId }) => {
    return _state.reduce<Product.GroupedResponse[]>((accumulator, currentValue) => {
      if (currentValue.categoryId !== categoryId) {
        return [
          ...accumulator,
          currentValue,
        ];
      }

      return [
        ...accumulator,
        {
          ...currentValue,
          products: currentValue.products.filter(p => !sourceProductIds.includes(p.productId)),
        },
      ];
    }, []);
  }),

  on(productApiActions.updateProductCompleted, (_state, { categoryId, productId, brand, measurement, unitOfMeasurement }) => {
    return _state.reduce<Product.GroupedResponse[]>((accumulator, currentValue) => {
      if (currentValue.categoryId !== categoryId) {
        return [
          ...accumulator,
          currentValue,
        ];
      }

      return [
        ...accumulator,
        {
          ...currentValue,
          products: currentValue.products.map((p) => p.productId !== productId ? p : {
            ...p,
            brand,
            measurement,
            unitOfMeasurement,
            fullName: `${brand} ${measurement} ${unitOfMeasurement}`,
          }).toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
            sensitivity: 'base',
          })),
        },
      ];
    }, []);
  }),
);
