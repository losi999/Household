import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { CategoryService } from '@household/web/services/category.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.action';

@Injectable()
export class CategoryEffects {
  constructor(private actions: Actions, private categoryService: CategoryService) {}

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
              notificationActions.showError({
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
                errorMessage = `Kategória név (${request.name}) már foglalt!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showError({
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
            map(() => categoryApiActions.listCategoriesInitiated()),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate category name': {
                  errorMessage = `Projekt név (${request.name}) már foglalt!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showError({
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
          mergeMap(() => [
            categoryApiActions.deleteCategoryCompleted({
              categoryId,
            }),
            categoryApiActions.listCategoriesInitiated(),
          ]),
          catchError(() => {
            return of(categoryApiActions.deleteCategoryFailed({
              categoryId,
            }), progressActions.processFinished(),
            notificationActions.showError({
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
          map(() => categoryApiActions.mergeCategoriesCompleted({
            sourceCategoryIds,
          })),
          catchError(() => {
            return of(categoryApiActions.mergeCategoriesFailed({
              sourceCategoryIds,
            }), progressActions.processFinished(),
            notificationActions.showError({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

