import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialog, ProductDialogData, ProductDialogResult } from '@household/app/product/product-dialog/product-dialog';
import { ProductMergeDialog, ProductMergeDialogData, ProductMergeDialogResult } from '@household/app/product/product-merge-dialog/product-merge-dialog';
import { ProductSelectDialog, ProductSelectDialogData, ProductSelectDialogResult } from '@household/app/product/product-select-dialog/product-select-dialog';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { BottomSheetService, DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map, Observable } from 'rxjs';

export const withProductEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const bottomSheetService = inject(BottomSheetService);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);

      return {
        openCreateProductDialog: events.on(productEvents.createProduct).pipe(
          exhaustMap(() => {
            return dialog.open<ProductDialog, ProductDialogData, ProductDialogResult>(ProductDialog, {
              disableClose: true,
            }).afterClosed();
          }),
          filter(req => !!req),
          map((request) => {
            return productApiEvents.createProductInitiated(request);
          }),
        ),
        openUpdateProductDialog: events.on(productEvents.updateProduct).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<ProductDialog, ProductDialogData, ProductDialogResult>(ProductDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(
                filter(req => !!req),
                map((request) => {
                  return productApiEvents.updateProductInitiated({
                    productId: payload.productId,
                    ...request,
                  });
                }),
              );
          }),
        ),
        openProductSelectDialog: events.on(productEvents.selectProduct).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<ProductSelectDialog, ProductSelectDialogData, ProductSelectDialogResult>(ProductSelectDialog, {
              disableClose: true,
              data: payload,
              width: '90vw',
              height: '80vh',
            }).afterClosed();
          }),
          filter(res => !!res),
          map((response) => {
            return productEvents.productSelected(response);
          }),
        ),
        openMergeProductsDialog: events.on(productEvents.mergeProducts).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<ProductMergeDialog, ProductMergeDialogData, ProductMergeDialogResult>(ProductMergeDialog, {
              disableClose: true,
              data: payload,
              width: '90vw',
              height: '80vh',
            }).afterClosed();
          }),
          filter(req => !!req),
          map((request) => {
            return productApiEvents.mergeProductsInitiated(request);
          }),
        ),
        openDeleteProductDialog: events.on(productEvents.deleteProduct).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a terméket?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(productApiEvents.deleteProductInitiated({
                productId: payload.productId,
              })),
            );
          }),
        ),
        openProductListItemSubmenu: events.on(productEvents.openProductListItemSubmenu)
          .pipe(
            exhaustMap(({ payload: { product, hasChildren } }) => {
              let afterDismissed: Observable<'edit' | 'merge' | 'delete'>;

              // A product with children cannot be deleted, so the delete action is not offered
              if (hasChildren) {
                afterDismissed = bottomSheetService.openBottomSubmenu(product.name, 'edit', 'merge').afterDismissed();
              } else {
                afterDismissed = bottomSheetService.openBottomSubmenu(product.name, 'edit', 'merge', 'delete').afterDismissed();
              }

              return afterDismissed.pipe(
                filter(value => !!value),
                map((value) => {
                  switch(value) {
                    case 'edit': return productEvents.updateProduct(product);
                    case 'delete': return productEvents.deleteProduct(product);
                    case 'merge': return productEvents.mergeProducts(product);
                  }
                }),
              );
            }),
          ),
      };
    }),
  );
};
