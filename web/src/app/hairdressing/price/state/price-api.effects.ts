import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { PriceService } from '@household/web/services/price.service';

@Injectable()
export class PriceApiEffects {
  constructor(private actions: Actions, private priceService: PriceService) {}

  listPrices = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.listPricesInitiated),
      exhaustMap(() => {
        return this.priceService.listPrices().pipe(
          map((prices) => priceApiActions.listPricesCompleted({
            prices,
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
  
  createPrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.createPriceInitiated),
      mergeMap(({ type, ...request }) => {
        return this.priceService.createPrice(request).pipe(
          map(({ priceId }) => priceApiActions.createPriceCompleted({
            priceId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate price name': {
                errorMessage = `Árlista elem (${request.name}) már létezik!`;
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

  updatePrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.updatePriceInitiated),
      groupBy(({ priceId }) => priceId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, priceId, ...request }) => {
          return this.priceService.updatePrice(priceId, request).pipe(
            map(({ priceId }) => priceApiActions.updatePriceCompleted({
              priceId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate price name': {
                  errorMessage = `Árlista elem (${request.name}) már létezik!`;
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
  
  deletePrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.deletePriceInitiated),
      mergeMap(({ priceId }) => {
        return this.priceService.deletePrice(priceId).pipe(
          map(() => priceApiActions.deletePriceCompleted({
            priceId,
          })),
          catchError(() => {
            return of(priceApiActions.deletePriceFailed({
              priceId,
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

