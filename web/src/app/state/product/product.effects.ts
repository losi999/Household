import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { productApiActions } from 'src/app/state/product/product.actions';
import { ProductService } from 'src/app/product/product.service';
import { progressActions } from 'src/app/state/progress/progress.actions';
import { notificationActions } from 'src/app/state/notification/notification.action';

@Injectable()
export class ProductEffects {
  constructor(private actions: Actions, private productService: ProductService) {}

  // loadProducts = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(productApiActions.listProductsInitiated),
  //     exhaustMap(() => {
  //       return this.productService.listProducts().pipe(
  //         map((products) => productApiActions.listProductsCompleted({
  //           products,
  //         })),
  //         catchError(() => {
  //           return of(progressActions.processFinished(),
  //             notificationActions.showError({
  //               message: 'Hiba történt',
  //             }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });

  createProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.createProductInitiated),
      mergeMap(({ type, categoryId, ...request }) => {
        return this.productService.createProduct(categoryId, request).pipe(
          map(({ productId }) => productApiActions.createProductCompleted({
            productId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate product name': {
                // errorMessage = `Projekt név (${request.name}) már foglalt!`;
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

  updateProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.updateProductInitiated),
      groupBy(({ productId }) => productId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, productId, ...request }) => {
          return this.productService.updateProduct(productId, request).pipe(
            map(({ productId }) => productApiActions.updateProductCompleted({
              productId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate product name': {
                  // errorMessage = `Projekt név (${request.name}) már foglalt!`;
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

  deleteProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.deleteProductInitiated),
      mergeMap(({ productId }) => {
        return this.productService.deleteProduct(productId).pipe(
          map(() => productApiActions.deleteProductCompleted({
            productId,
          })),
          catchError(() => {
            return of(productApiActions.deleteProductFailed({
              productId,
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

  mergeProducts = createEffect(() => {
    return this.actions.pipe(
      ofType(productApiActions.mergeProductsInitiated),
      exhaustMap(({ sourceProductIds, targetProductId }) => {
        return this.productService.mergeProducts(targetProductId, sourceProductIds).pipe(
          map(() => productApiActions.mergeProductsCompleted({
            sourceProductIds,
          })),
          catchError(() => {
            return of(productApiActions.mergeProductsFailed({
              sourceProductIds,
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

