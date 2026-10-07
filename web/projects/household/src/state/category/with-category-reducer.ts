import { categoryApiEvents } from '@household/state/category/category-events';
import { CategoryState } from '@household/state/category/category-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withCategoryReducer = () => {
  return signalStoreFeature(
    withReducer<CategoryState>(
      on(categoryApiEvents.listCategoriesCompleted, ({ payload }) => {
        return {
          categoryList: payload.map(p => {
            return {
              ...p,
              searchTerms: toSearchTerms(p.name),
            };
          }),
        };
      }),
      on(categoryApiEvents.updateCategoryInitiated, categoryApiEvents.deleteCategoryInitiated, ({ payload: { categoryId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              categoryId,
            ],
          };
        };
      }),
      on(categoryApiEvents.updateCategoryCompleted, categoryApiEvents.deleteCategoryCompleted, categoryApiEvents.updateCategoryFailed, categoryApiEvents.deleteCategoryFailed, ({ payload: { categoryId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== categoryId),
          };
        };
      }),
      on(categoryApiEvents.createCategoryCompleted, categoryApiEvents.updateCategoryCompleted, ({ payload: { categoryId, name, categoryType, parentCategoryId } }) => {
        return (state) => {
          const parentCategory = state.categoryList.find(c => c.categoryId === parentCategoryId);

          return {
            categoryList: state.categoryList.filter(p => p.categoryId !== categoryId)
              .concat({
                categoryId,
                name,
                categoryType,
                fullName: parentCategory ? `${parentCategory.fullName}:${name}` : name,
                parentCategory: parentCategory ? {
                  categoryId: parentCategory.categoryId,
                  categoryType: parentCategory.categoryType,
                  fullName: parentCategory.fullName,
                  name: parentCategory.name,
                } : undefined,
                ancestors: parentCategory ? [
                  ...parentCategory.ancestors,
                  parentCategory,
                ] : [],
                searchTerms: toSearchTerms(name),
              })
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(categoryApiEvents.deleteCategoryCompleted, ({ payload: { categoryId } }) => {
        return (state) => {
          return {
            categoryList: state.categoryList.filter(p => p.categoryId !== categoryId),
          };
        };
      }),
      on(categoryApiEvents.mergeCategoriesInitiated, ({ payload: { sourceCategoryIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: sourceCategoryIds,
          };
        };
      }),
      on(categoryApiEvents.mergeCategoriesCompleted, categoryApiEvents.mergeCategoriesFailed, ({ payload: { sourceCategoryIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: state.isInProgress.filter(p => !sourceCategoryIds.includes(p)),
          };
        };
      }),
      on(categoryApiEvents.mergeCategoriesCompleted, ({ payload: { sourceCategoryIds } }) => {
        return (state) => {
          return {
            ...state,
            categoryList: state.categoryList.filter(p => !sourceCategoryIds.includes(p.categoryId)),
          };
        };
      }),
    ),
  );
};
