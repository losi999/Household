import { Category, Product } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectGroupedProducts = createFeatureSelector<Product.GroupedResponse[]>('products');

export const selectProductsOfCategory = (categoryId: Category.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.find(c => c.categoryId === categoryId)?.products ?? [];
});
