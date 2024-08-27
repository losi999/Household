import { Category, Product } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectInventoryCategories } from '@household/web/state/category/category.selector';

export const selectProducts = createFeatureSelector<Product.Response[]>('products');

export const selectProductsOfCategory = (categoryId: Category.Id) => createSelector(selectInventoryCategories, (categories) => {
  return categories.find(c => c.categoryId === categoryId).products;
});
