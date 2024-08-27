import { Category, Product } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectInventoryCategories } from 'src/app/state/category/category.selector';

export const selectProducts = createFeatureSelector<Product.Response[]>('products');

export const selectProductsOfCategory = (categoryId: Category.Id) => createSelector(selectInventoryCategories, (categories) => {
  return categories.find(c => c.categoryId === categoryId).products;
});
