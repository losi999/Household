import { inject } from '@angular/core';
import { CategoryService } from '@household/services/category-service';
import { categoryApiEvents } from '@household/state/category/category-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withCategoryApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const categoryService = inject(CategoryService);

      return {
        listCategories: events.on(categoryApiEvents.listCategoriesInitiated).pipe(
          exhaustMap(() => {
            return categoryService.listCategories().pipe(
              map((categories) => categoryApiEvents.listCategoriesCompleted(categories)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createCategory: events.on(categoryApiEvents.createCategoryInitiated).pipe(
          mergeMap(({ payload }) => {
            return categoryService.createCategory(payload).pipe(
              map(({ categoryId }) => categoryApiEvents.createCategoryCompleted({
                categoryId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate category name': {
                    errorMessage = `Kategória (${payload.name}) már létezik!`;
                  } break;
                  default: {
                    errorMessage = 'Hiba történt';
                  }
                }
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        updateCategory: events.on(categoryApiEvents.updateCategoryInitiated).pipe(
          groupBy(({ payload }) => payload.categoryId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { categoryId, ...request } }) => {
              return categoryService.updateCategory(categoryId, request).pipe(
                map(() => categoryApiEvents.updateCategoryCompleted({
                  categoryId,
                  ...request,
                })),
                catchError((error) => {
                  let errorMessage: string;
                  switch(error.error?.message) {
                    case 'Duplicate category name': {
                      errorMessage = `Kategória (${request.name}) már létezik!`;
                    } break;
                    default: {
                      errorMessage = 'Hiba történt';
                    }
                  }
                  return [
                    categoryApiEvents.updateCategoryFailed({
                      categoryId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteCategory: events.on(categoryApiEvents.deleteCategoryInitiated).pipe(
          mergeMap(({ payload: { categoryId } }) => {
            return categoryService.deleteCategory(categoryId).pipe(
              map(() => categoryApiEvents.deleteCategoryCompleted({
                categoryId,
              })),
              catchError(() => {
                return [
                  categoryApiEvents.deleteCategoryFailed({
                    categoryId,
                  }), 
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),    
        ),
        mergeCategories: events.on(categoryApiEvents.mergeCategoriesInitiated).pipe(
          mergeMap(({ payload: { targetCategoryId, sourceCategoryIds } }) => {
            return categoryService.mergeCategories(targetCategoryId, sourceCategoryIds).pipe(
              map(() => categoryApiEvents.mergeCategoriesCompleted({
                sourceCategoryIds,
              })),
              catchError(() => {
                return [
                  categoryApiEvents.mergeCategoriesFailed({
                    sourceCategoryIds,
                  }), 
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
      };
    }),
  );
};
