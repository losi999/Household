import { Category, Product } from '@household/shared/types/types';
import { selectCategories } from '@household/web/state/category/category.selector';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectGroupedProducts = createFeatureSelector<Product.GroupedResponse[]>('products');

export const selectCategoryOfProductId = (productId: Product.Id) => createSelector(selectGroupedProducts, selectCategories, (groups, categories) => {
  const categoryId = groups.find(g => g.products.some(p => p.productId === productId))?.categoryId;

  return categories.find(c => c.categoryId === categoryId);
});

export const selectProductById = (productId: Product.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.flatMap(g => g.products).find(p => p.productId === productId);
});

export const selectProductsOfCategory = (categoryId: Category.Id) => createSelector(selectGroupedProducts, (groups) => {
  return groups.find(c => c.categoryId === categoryId)?.products ?? [];
});
