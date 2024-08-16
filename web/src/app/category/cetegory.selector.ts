import { Category } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCategories = createFeatureSelector<Category.Response[]>('categories');

export const selectInventoryCategories = createSelector(selectCategories, (categories) => {
  return categories.filter(c => c.categoryType === 'inventory');
});
