import { Category } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const categoryApiActions = createActionGroup({
  source: 'Category API',
  events: {
    'List categories initiated': emptyProps(),
    'List categories completed': props<{categories: Category.Response[]}>(),
    'Create category initiated': props<Category.Request>(),
    'Create category completed': props<Category.CategoryId & Category.Request>(),
    'Merge categories initiated': props<{
      sourceCategoryIds: Category.Id[];
      targetCategoryId: Category.Id;
    }>(),
    'Merge categories completed': props<{sourceCategoryIds: Category.Id[]}>(),
    'Merge categories failed': props<{sourceCategoryIds: Category.Id[]}>(),
    'Update category initiated': props<Category.CategoryId & Category.Request>(),
    'Update category completed': props<Category.CategoryId & Category.Request>(),
    'Delete category initiated': props<Category.CategoryId>(),
    'Delete category completed': props<Category.CategoryId>(),
    'Delete category failed': props<Category.CategoryId>(),
  },
});
