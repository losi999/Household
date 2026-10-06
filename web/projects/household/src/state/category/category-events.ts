
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const categoryEvents = eventGroup({
  source: 'Category',
  events: {
    createCategory: type<void>(),
    updateCategory: type<Api.Category.CategoryId & Responses.Category>(),
    deleteCategory: type<Responses.Category>(),
    mergeCategories: type<Responses.Category>(),
    openCategoryListItemSubmenu: type<Responses.Category>(),
    editParentCategory: type<Responses.Category>(),
  },
});

export const categoryApiEvents = eventGroup({
  source: 'Category API',
  events: {
    listCategoriesInitiated: type<void>(),
    listCategoriesCompleted: type<Responses.Category[]>(),
    createCategoryInitiated: type<Requests.Category>(),
    createCategoryCompleted: type<Api.Category.CategoryId & Requests.Category>(),
    updateCategoryInitiated: type<Api.Category.CategoryId & Requests.Category>(),
    updateCategoryCompleted: type<Api.Category.CategoryId & Requests.Category>(),
    updateCategoryFailed: type<Api.Category.CategoryId>(),
    deleteCategoryInitiated: type<Api.Category.CategoryId>(),
    deleteCategoryCompleted: type<Api.Category.CategoryId>(),
    deleteCategoryFailed: type<Api.Category.CategoryId>(),
    mergeCategoriesInitiated: type<{
      sourceCategoryIds: Api.Category.Id[];
      targetCategoryId: Api.Category.Id;
    }>(),
    mergeCategoriesCompleted: type<{
      sourceCategoryIds: Api.Category.Id[];
    }>(),
    mergeCategoriesFailed: type<{
      sourceCategoryIds: Api.Category.Id[];
    }>(),
  },
});

