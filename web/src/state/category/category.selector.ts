import { Category } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCategories = createFeatureSelector<Category.Response[]>('categories');

export const selectCategoryById = (categoryId: Category.Id) => createSelector(selectCategories, (categories) => {
  return categories.find(a => a.categoryId === categoryId);
});

export const selectCategoriesAsParent = (categoryId: Category.Id) => createSelector(selectCategories, (categories) => {
  return categories.filter(c => c.categoryId !== categoryId && c.ancestors.every(a => a.categoryId !== categoryId));
});

export const selectMergableCategories = (categoryId: Category.Id) => createSelector(selectCategories, (categories) => {
  const targetCategory = categories.find(c => c.categoryId === categoryId);
  const targetCategoryAncestorIds = targetCategory.ancestors.map(a => a.categoryId);
  return categories.filter(c => c.categoryId !== categoryId && !targetCategoryAncestorIds.includes(c.categoryId) && c.categoryType === targetCategory.categoryType);
});

export const selectInventoryCategories = createSelector(selectCategories, (categories) => {
  return categories.filter(c => c.categoryType === 'inventory');
});

