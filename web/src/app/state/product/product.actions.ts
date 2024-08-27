import { Category, Product } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const productApiActions = createActionGroup({
  source: 'Product API',
  events: {
    'List products initiated': emptyProps(),
    'List products completed': props<{products: Product.Response[]}>(),
    'Create product initiated': props<Category.CategoryId & Product.Request>(),
    'Create product completed': props<Product.ProductId & Product.Request>(),
    'Merge products initiated': props<{
      sourceProductIds: Product.Id[];
      targetProductId: Product.Id;
    }>(),
    'Merge products completed': props<{sourceProductIds: Product.Id[]}>(),
    'Merge products failed': props<{sourceProductIds: Product.Id[]}>(),
    'Update product initiated': props<Product.ProductId & Product.Request>(),
    'Update product completed': props<Product.ProductId & Product.Request>(),
    'Delete product initiated': props<Product.ProductId>(),
    'Delete product completed': props<Product.ProductId>(),
    'Delete product failed': props<Product.ProductId>(),
  },
});
