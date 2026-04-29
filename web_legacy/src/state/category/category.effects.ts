import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { CategoryService } from '@household/web/services/category.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class CategoryEffects {
  constructor(private actions: Actions, private categoryService: CategoryService) {}

  refreshList = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.updateCategoryCompleted, categoryApiActions.deleteCategoryCompleted, categoryApiActions.mergeCategoriesCompleted),
      map(() => categoryApiActions.listCategoriesInitiated()),
    );
  });

  loadCategories = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.listCategoriesInitiated),
      exhaustMap(() => {
        return this.categoryService.listCategories().pipe(
          map((categories) => categoryApiActions.listCategoriesCompleted({
            categories,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.createCategoryInitiated),
      mergeMap(({ type, ...request }) => {
        return this.categoryService.createCategory(request).pipe(
          map(({ categoryId }) => categoryApiActions.createCategoryCompleted({
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
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.updateCategoryInitiated),
      groupBy(({ categoryId }) => categoryId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, categoryId, ...request }) => {
          return this.categoryService.updateCategory(categoryId, request).pipe(
            map(() => categoryApiActions.updateCategoryCompleted()),
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
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));
      }),
    );
  });

  deleteCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.deleteCategoryInitiated),
      mergeMap(({ categoryId }) => {
        return this.categoryService.deleteCategory(categoryId).pipe(
          map(() => categoryApiActions.deleteCategoryCompleted()),
          catchError(() => {
            return of(categoryApiActions.deleteCategoryFailed({
              categoryId,
            }), progressActions.processFinished(),
            notificationActions.showMessage({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });

  mergeCategories = createEffect(() => {
    return this.actions.pipe(
      ofType(categoryApiActions.mergeCategoriesInitiated),
      exhaustMap(({ sourceCategoryIds, targetCategoryId }) => {
        return this.categoryService.mergeCategories(targetCategoryId, sourceCategoryIds).pipe(
          map(() => categoryApiActions.mergeCategoriesCompleted()),
          catchError(() => {
            return of(categoryApiActions.mergeCategoriesFailed({
              sourceCategoryIds,
            }), progressActions.processFinished(),
            notificationActions.showMessage({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

