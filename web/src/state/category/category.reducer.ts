import { Clean } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';

export const categoryReducer = createReducer<Clean<Category.Response>[]>([],
  on(categoryApiActions.listCategoriesCompleted, (_state, { categories }) => {
    return categories;
  }),
  on(categoryApiActions.createCategoryCompleted, (_state, { categoryId, name, categoryType, parentCategoryId }) => {

    const parentCategory = _state.find(c => c.categoryId === parentCategoryId) as Category.ResponseBase;

    return _state.concat({
      categoryId,
      name,
      categoryType,
      parentCategory,
      fullName: parentCategory ? `${parentCategory.fullName}:${name}` : name,
      products: undefined,
    })
      .toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
        sensitivity: 'base',
      }));
  }),
  on(categoryApiActions.deleteCategoryCompleted, (_state, { categoryId }) => {
    return _state.filter(p => p.categoryId !== categoryId);
  }),
  on(categoryApiActions.mergeCategoriesCompleted, (_state, { sourceCategoryIds }) => {
    return _state.filter(p => !sourceCategoryIds.includes(p.categoryId));
  }),
);
