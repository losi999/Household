import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { CategoryState } from '@household/state/category/category-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';

export const withCategoryReducer = () => {
  return signalStoreFeature(
    withReducer<CategoryState>(
      on(categoryEvents.selectCategory, categoryEvents.createCategory, categoryEvents.updateCategory, () => {
        return {
          pendingParentCategory: undefined,
        };
      }),
      on(categoryEvents.categorySelected, ({ payload }) => {
        return {
          pendingParentCategory: payload,
        };
      }),
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
          const childCategoriesIds = state.categoryList.filter(c => c.ancestors.some(a => a.categoryId === categoryId)).map(c => c.categoryId);

          return {
            isInProgress: [
              ...state.isInProgress,
              ...childCategoriesIds,
              categoryId,
            ],
          };
        };
      }),
      on(categoryApiEvents.updateCategoryFailed, categoryApiEvents.deleteCategoryFailed, ({ payload: { categoryId } }) => {
        return (state) => {
          const childCategoriesIds = state.categoryList.filter(c => c.ancestors.some(a => a.categoryId === categoryId)).map(c => c.categoryId);
                    
          return {
            isInProgress: state.isInProgress.filter(id => ![
              ...childCategoriesIds,
              categoryId,
            ].includes(id)),
          };
        };
      }),
      on(categoryApiEvents.createCategoryCompleted, ({ payload: { categoryId, name, categoryType, parentCategoryId } }) => {
        return (state) => {
          const parentCategory = state.categoryList.find(c => c.categoryId === parentCategoryId);

          return {
            categoryList: state.categoryList.concat({
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
              .toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(categoryApiEvents.updateCategoryCompleted, ({ payload: { categoryId, name, categoryType, parentCategoryId } }) => {
        return (state) => {
          const childCategoriesIds = state.categoryList.filter(c => c.ancestors.some(a => a.categoryId === categoryId)).map(c => c.categoryId);
          const parentCategory = state.categoryList.find(c => c.categoryId === parentCategoryId);
          const updatedCategory: Searchable<Responses.Category> = {
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
              {
                categoryId: parentCategory.categoryId,
                categoryType: parentCategory.categoryType,
                name: parentCategory.name,
              },
            ] : [],
            searchTerms: toSearchTerms(name),
          };

          return {
            isInProgress: state.isInProgress.filter(id => ![
              ...childCategoriesIds,
              categoryId,
            ].includes(id)),
            categoryList: state.categoryList.reduce<Searchable<Responses.Category>[]>((accumulator, currentValue) => {
              if (currentValue.categoryId === categoryId) {
                return [
                  ...accumulator,
                  updatedCategory,
                ];
              }

              if (childCategoriesIds.includes(currentValue.categoryId)) {
                const indexInAncestors = currentValue.ancestors.findIndex(a => a.categoryId === categoryId);
                const remainingAncestors = currentValue.ancestors.slice(indexInAncestors + 1);
                const updatedAncestors = [
                  ...updatedCategory.ancestors,
                  {
                    categoryId: updatedCategory.categoryId,
                    categoryType: updatedCategory.categoryType,
                    name: updatedCategory.name,
                  },
                  ...remainingAncestors,
                ];
                const parentFullName = updatedAncestors.map(a => a.name).join(':');
                const newParent = updatedAncestors.at(-1);
                return [
                  ...accumulator,
                  {
                    ...currentValue,
                    ancestors: updatedAncestors,
                    fullName: `${parentFullName}:${ currentValue.name}`,
                    parentCategory: {
                      categoryId: newParent.categoryId,
                      categoryType: newParent.categoryType,
                      name: newParent.name,
                      fullName: parentFullName,
                    },
                  },
                ];
              }

              return [
                ...accumulator,
                currentValue,
              ];
            }, []).toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
              sensitivity: 'base',
            })),
          };
        };
      }),
      on(categoryApiEvents.deleteCategoryCompleted, ({ payload: { categoryId } }) => {
        return (state) => {
          const childCategoriesIds = state.categoryList.filter(c => c.ancestors.some(a => a.categoryId === categoryId)).map(c => c.categoryId);

          return {
            isInProgress: state.isInProgress.filter(id => ![
              ...childCategoriesIds,
              categoryId,
            ].includes(id)),
            categoryList: state.categoryList.reduce<Searchable<Responses.Category>[]>((accumulator, currentValue) => {
              if (currentValue.categoryId === categoryId) {
                return accumulator;
              }

              if (childCategoriesIds.includes(currentValue.categoryId)) {
                const ancestors = currentValue.ancestors.filter(a => a.categoryId !== categoryId);
                const parentFullName = ancestors.map(a => a.name).join(':');
                const parentCategory = ancestors.at(-1);

                return [
                  ...accumulator,
                  {
                    ...currentValue,
                    ancestors,
                    fullName: parentFullName ? `${parentFullName}:${currentValue.name}` : currentValue.name,
                    parentCategory: parentCategory ? {
                      ...parentCategory,
                      fullName: parentFullName,
                    } : undefined,
                  },
                ];
              }

              return [
                ...accumulator,
                currentValue,
              ];
            }, []).toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
              sensitivity: 'base',
            })),
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
