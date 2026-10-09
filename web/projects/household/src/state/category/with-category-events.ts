import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialog, CategoryDialogData, CategoryDialogResult } from '@household/app/category/category-dialog/category-dialog';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { DialogService, BottomSheetService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';
import { CategoryMergeDialog, CategoryMergeDialogData, CategoryMergeDialogResult } from '@household/app/category/category-merge-dialog/category-merge-dialog';
import { CategorySelectDialog, CategorySelectDialogData, CategorySelectDialogResult } from '@household/app/category/category-select-dialog/category-select-dialog';

export const withCategoryEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {

      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);
      const bottomSheetService = inject(BottomSheetService);

      return {
        openCreateCategoryDialog: events.on(categoryEvents.createCategory)
          .pipe(
            exhaustMap(() => {
              return dialog.open<CategoryDialog, CategoryDialogData, CategoryDialogResult>(CategoryDialog, {
                disableClose: true,
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return categoryApiEvents.createCategoryInitiated(request);
            }),
          ),
        openUpdateCategoryDialog: events.on(categoryEvents.updateCategory).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<CategoryDialog, CategoryDialogData, CategoryDialogResult>(CategoryDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return categoryApiEvents.updateCategoryInitiated({
                    categoryId: payload.categoryId,
                    ...request,
                  });
                }));
          }),    
        ),
        openDeleteCategoryDialog: events.on(categoryEvents.deleteCategory).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a kategóriát?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(categoryApiEvents.deleteCategoryInitiated({
                categoryId: payload.categoryId,
              })),
            );
          }),
        ),
        openCategoryListItemSubmenu: events.on(categoryEvents.openCategoryListItemSubmenu)
          .pipe(
            exhaustMap(({ payload }) => {
              return bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'merge', 'delete')
                .afterDismissed()
                .pipe(
                  filter(value => !!value),
                  map((value) => {
                    switch(value) {
                      case 'edit': return categoryEvents.updateCategory(payload);
                      case 'delete': return categoryEvents.deleteCategory(payload);
                      case 'merge': return categoryEvents.mergeCategories(payload);
                    }
                  }),
                );
            }),
          ),
        openMergeCategoriesDialog: events.on(categoryEvents.mergeCategories)
          .pipe(
            exhaustMap(({ payload }) => {
              return dialog.open<CategoryMergeDialog, CategoryMergeDialogData, CategoryMergeDialogResult>(CategoryMergeDialog, {
                disableClose: true,
                data: payload,
                width: '90vw',
                height: '80vh',
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return categoryApiEvents.mergeCategoriesInitiated(request);
            }),
          ),
        openCategorySelectDialog: events.on(categoryEvents.selectCategory)
          .pipe(
            exhaustMap(({ payload }) => {
              return dialog.open<CategorySelectDialog, CategorySelectDialogData, CategorySelectDialogResult>(CategorySelectDialog, {
                disableClose: true,
                data: payload,
                width: '90vw',
                height: '80vh',
              }).afterClosed();
            }),
            filter(res => !!res),
            map((response) => {
              return categoryEvents.categorySelected(response);
            }),
          ),
      };
    },
    ),
  );
};
