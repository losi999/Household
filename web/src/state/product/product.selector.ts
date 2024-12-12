import { Category, Product } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectGroupedProducts = createFeatureSelector<Product.GroupedResponse[]>('products');

export const selectCategoryIdOfProductId = (productId: Product.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.find(g => g.products.some(p => p.productId === productId))?.categoryId;
});

export const selectProductById = (productId: Product.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.flatMap(g => g.products).find(p => p.productId === productId);
});

export const selectProductsOfCategory = (categoryId: Category.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.find(c => c.categoryId === categoryId)?.products ?? [];
});
