import { Category } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCategories = createFeatureSelector<Category.Response[]>('categories');

export const selectCategoriesAsParent = (categoryId: Category.Id) => createSelector(selectCategories, (categories) => {
  return categories.filter(c => c.categoryId !== categoryId && c.ancestors.every(a => a.categoryId !== categoryId));
});

export const selectMergableCategories = (categoryId: Category.Id) => createSelector(selectCategories, (categories) => {
  const targetCategoryAncestorIds = categories.find(c => c.categoryId === categoryId).ancestors.map(a => a.categoryId);
  return categories.filter(c => c.categoryId !== categoryId && !targetCategoryAncestorIds.includes(c.categoryId));
});

export const selectInventoryCategories = createSelector(selectCategories, (categories) => {
  return categories.filter(c => c.categoryType === 'inventory');
});

