import { Category } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';

export const categoryReducer = createReducer<Category.Response[]>([],
  on(categoryApiActions.listCategoriesCompleted, (_state, { categories }) => {
    return categories;
  }),
  on(categoryApiActions.createCategoryCompleted, (_state, { categoryId, name, categoryType, parentCategoryId }) => {

    const parentCategory = _state.find(c => c.categoryId === parentCategoryId);

    return _state.concat({
      categoryId,
      categoryType,
      name,
      parentCategory: parentCategory ? {
        categoryId: parentCategory.categoryId,
        categoryType: parentCategory.categoryType,
        fullName: parentCategory.fullName,
        name: parentCategory.name,
      } : undefined,
      fullName: parentCategory ? `${parentCategory.fullName}:${name}` : name,
      ancestors: parentCategory ? [
        ...parentCategory.ancestors,
        parentCategory,
      ] : [],
    })
      .toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
        sensitivity: 'base',
      }));
  }),
);
