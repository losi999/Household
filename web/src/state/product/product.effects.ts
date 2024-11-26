import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { productApiActions } from '@household/web/state/product/product.actions';
import { ProductService } from '@household/web/services/product.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class ProductEffects {
  constructor(private actions: Actions, private productService: ProductService) {}

  loadProducts = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.listProductsInitiated),
      exhaustMap(() => {
        return this.productService.listProducts().pipe(
          map((products) => productApiActions.listProductsCompleted({
            products,
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

  createProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.createProductInitiated),
      mergeMap(({ type, categoryId, ...request }) => {
        return this.productService.createProduct(categoryId, request).pipe(
          map(() => productApiActions.listProductsInitiated()),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate product name': {
                errorMessage = `Termék (${request.brand} ${request.measurement} ${request.unitOfMeasurement}) már létezik!`;
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

  updateProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.updateProductInitiated),
      groupBy(({ productId }) => productId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, productId, categoryId, ...request }) => {
          return this.productService.updateProduct(productId, request).pipe(
            map(({ productId }) => productApiActions.updateProductCompleted({
              productId,
              categoryId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate product name': {
                  errorMessage = `Termék (${request.brand} ${request.measurement} ${request.unitOfMeasurement}) már létezik!`;
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

  deleteProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.deleteProductInitiated),
      mergeMap(({ productId, categoryId }) => {
        return this.productService.deleteProduct(productId).pipe(
          map(() => productApiActions.deleteProductCompleted({
            productId,
            categoryId,
          })),
          catchError(() => {
            return of(productApiActions.deleteProductFailed({
              productId,
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

  mergeProducts = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.mergeProductsInitiated),
      exhaustMap(({ sourceProductIds, targetProductId, categoryId }) => {
        return this.productService.mergeProducts(targetProductId, sourceProductIds).pipe(
          map(() => productApiActions.mergeProductsCompleted({
            sourceProductIds,
            categoryId,
          })),
          catchError(() => {
            return of(productApiActions.mergeProductsFailed({
              sourceProductIds,
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

