import { inject } from '@angular/core';
import { ProductService } from '@household/services/product-service';
import { productApiEvents } from '@household/state/product/product-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withProductApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const productService = inject(ProductService);

      return {
        listProducts: events.on(productApiEvents.listProductsInitiated).pipe(
          exhaustMap(() => {
            return productService.listProducts().pipe(
              map((products) => productApiEvents.listProductsCompleted(products)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createProduct: events.on(productApiEvents.createProductInitiated).pipe(
          mergeMap(({ payload }) => {
            return productService.createProduct(payload).pipe(
              map(({ productId }) => productApiEvents.createProductCompleted({
                productId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate product name': {
                    errorMessage = `Termék (${payload.name}) már létezik!`;
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
        updateProduct: events.on(productApiEvents.updateProductInitiated).pipe(
          groupBy(({ payload }) => payload.productId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { productId, ...request } }) => {
              return productService.updateProduct(productId, request).pipe(
                map(() => productApiEvents.updateProductCompleted({
                  productId,
                  ...request,
                })),
                catchError((error) => {
                  let errorMessage: string;
                  switch(error.error?.message) {
                    case 'Duplicate product name': {
                      errorMessage = `Termék (${request.name}) már létezik!`;
                    } break;
                    default: {
                      errorMessage = 'Hiba történt';
                    }
                  }
                  return [
                    productApiEvents.updateProductFailed({
                      productId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteProduct: events.on(productApiEvents.deleteProductInitiated).pipe(
          mergeMap(({ payload: { productId } }) => {
            return productService.deleteProduct(productId).pipe(
              map(() => productApiEvents.deleteProductCompleted({
                productId,
              })),
              catchError(() => {
                return [
                  productApiEvents.deleteProductFailed({
                    productId,
                  }),
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
        mergeProducts: events.on(productApiEvents.mergeProductsInitiated).pipe(
          mergeMap(({ payload: { targetProductId, sourceProductIds } }) => {
            return productService.mergeProducts(targetProductId, sourceProductIds).pipe(
              map(() => productApiEvents.mergeProductsCompleted({
                sourceProductIds,
                targetProductId,
              })),
              catchError(() => {
                return [
                  productApiEvents.mergeProductsFailed({
                    sourceProductIds,
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
