import { Category, Product } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const productApiActions = createActionGroup({
  source: 'Product API',
  events: {
    'List products initiated': emptyProps(),
    'List products completed': props<{products: Product.GroupedResponse[]}>(),
    'Create product initiated': props<Category.CategoryId & Product.Request>(),
    'Create product completed': props<Product.ProductId & Product.Request>(),
    'Merge products initiated': props<{
      sourceProductIds: Product.Id[];
      targetProductId: Product.Id;
    } & Category.CategoryId>(),
    'Merge products completed': props<{sourceProductIds: Product.Id[]} & Category.CategoryId>(),
    'Merge products failed': props<{sourceProductIds: Product.Id[]}>(),
    'Update product initiated': props<Product.ProductId & Product.Request & Category.CategoryId>(),
    'Update product completed': props<Product.ProductId & Product.Request & Category.CategoryId>(),
    'Delete product initiated': props<Product.ProductId & Category.CategoryId>(),
    'Delete product completed': props<Product.ProductId & Category.CategoryId>(),
    'Delete product failed': props<Product.ProductId>(),
  },
});
